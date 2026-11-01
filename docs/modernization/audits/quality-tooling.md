# 品質・開発基盤・運用調査

調査対象: `/workspace/harvest-webapp` と `/workspace/harvest-serverless-api`。コード変更、依存インストール、AWS呼出しは実施していない。両リポジトリ内に AGENTS.md は見つからなかった。

## 結論

依存更新を支える回帰検知の仕組みを先に作る必要がある。既存テストは大半が生成時の雛形であり、実アプリを保護していない。CIの構成ファイルは両リポジトリの追跡ファイルに存在しない（外部で設定されたCIの有無は未確認）。更新の成功条件を「ビルド成功」だけにすると、権限、課金、写真、Excel、PWAの後退を見落とす。

## 棚卸しと根拠

| 領域 | 現状 | 根拠 |
|---|---|---|
| FE unit | 34 spec ファイル、36 it ケース。32件が生成確認、さらに2件が存在確認。残る2件はタイトルと旧Welcome表示 | `src/app/shared/services/projects/projects.service.spec.ts:6`, `src/app/shared/guards/auth/auth.guard.spec.ts:12`, `src/app/shared/components/sidenav/sidenav.component.spec.ts:39`, `src/app/app.component.spec.ts:23` |
| FE テスト破損 | 13ファイルに15件の存在しないimport。Dashboardは別アプリのLayoutComponent等を参照 | `src/app/private/dashboard/dashboard.component.spec.ts:4`, `src/app/private/corporation/corporation.component.spec.ts:3` |
| FE テストDI | HttpClientを必要とするProjectsServiceに空のTestBed、SwUpdateを必要とするAppComponentにもstubなし | `src/app/shared/services/projects/projects.service.ts:31`, 同spec:6, `src/app/app.component.ts:12`, 同spec:7 |
| FE E2E | Protractor 5.4系。1 spec / 1ケースで旧Welcomeのh1を探すだけ。現Appテンプレートにh1はない | `package.json:56`, `e2e/src/app.e2e-spec.ts:11`, `e2e/src/app.po.ts:9`, `src/app/app.component.html:3` |
| coverage | Karmaにreporter設定はあるが閾値なし。業務フローのassertionなし。実測coverageは未取得 | `src/karma.conf.js:18` |
| FE test runner | Karma 4、Jasmine 3、Chrome GUI、watch前提。CI用コマンドなし | `package.json:45`, `src/karma.conf.js:27`, `package.json:4` |
| FE lint | TSLint 5 / codelyzer 5。多数の既存違反と4つの未解決ルール | `package.json:48`, `package.json:58`, `tslint.json` |
| FE build | Angular CLI 8の旧browser builder、ES5 target。prod budgetは警告2MB/上限5MB。Node/npmの固定、engines、packageManagerなし | `angular.json:18`, `angular.json:56`, `tsconfig.json:13`, `package.json` |
| FE lock | lockfileVersion 1。現環境Node 24.19.0 / npm 11.9.0と旧世代構成の組合せ | `package-lock.json:4` |
| BE tests | 1ファイル1ケース。存在しないhello_worldをimportしてhello worldを検証するSAM雛形 | `tests/unit/test_handler.py:6`, `tests/unit/test_handler.py:66` |
| BE manifest | route別requirementsが6個、各 `requests==2.20.0` と無固定boto3のみ。openpyxl/Pillow/dateutil等の実importと不一致。トップレベルpyproject/lock/dev depsなし | `routes/projects/requirements.txt:1`, `routes/site-packages/harvest/utils/excel_doc_generator.py:5`, `routes/site-packages/harvest/commons/billing/billing.py:2` |
| BE packaging | 全Lambda CodeUriはroutes、PYTHONPATHでsite-packagesを参照。deployはsam buildを実行せず元templateをpackage | `template.yaml:67`, `template.yaml:72`, `deploy.sh:5` |
| FE deployment | prod S3/CloudFront固定、ビルド/テストなしで既存distを同期、全ファイルcache 1h、旧asset削除、全path invalidation | `deploy.sh:4`, `deploy.sh:8` |
| BE deployment | 環境/stack固定、テストなし。`[ $? -ne 0 ] && exit` は直前のtest成功status=0で終了するため、失敗を成功exitとして扱い得る | `deploy.sh:2`, `deploy.sh:3`, `deploy.sh:5`, `deploy.sh:8` |
| README | FEはCLI 7.2.2雛形、BEは存在しないhello_world/hello/root requirementsを案内。AWS PowerUser前提 | FE `README.md:3`; BE `README.md:8`, `README.md:21`, `README.md:52`, `README.md:135` |
| Git hygiene | FE追跡220ファイル、BE81ファイル。FEにAppleDouble `._*` 8個が追跡され、うち1つは.spec.ts名 | FE `src/app/public/login/._login.component.spec.ts`; `.gitignore:42`には._*除外なし |

`src/test.ts:18` のwebpack require.contextは.spec.tsを再帰取得するため、AppleDoubleのspec名も不要な入力となる。これらは削除し、ignoreを追加する。BE `.gitignore:180` は `.python-version` を無視するため、将来ランタイム固定ファイルを採用する場合は見直す。同 `.gitignore:246` は依存と自作コードの同居を前提とし、現代的なsrc layoutに移行して不要にする。

## 実行した副作用のないチェック

- `./node_modules/.bin/tsc --project src/tsconfig.app.json --noEmit`: exit 0。テンプレート/AOT/実ブラウザの成功は意味しない。
- `./node_modules/.bin/tsc --project src/tsconfig.spec.json --noEmit`: exit 1、15 unresolved import errors。
- `npm run lint -- --force=false`: exit 1。既存コード違反のほか `use-input-property-decorator`, `use-output-property-decorator`, `use-host-property-decorator`, `use-life-cycle-interface` の実装未解決。
- `python -m pytest tests/ --collect-only -q -p no:cacheprovider`: 現在選択されたPython 3.12.14にpytestがなく、`No module named pytest`。テスト実行成功/失敗を判定できていない。hello_world不存在は静的確認で確定。
- BEの全root shell scriptに `bash -n`: 構文チェック成功。実AWS操作はしていない。

## 推奨する品質設計

### 1. テストは業務の境界から作る

まず現状のAPIリクエスト/レスポンス、権限表、CSV/XLSX入力出力、画像仕様をfixtureとして固定する。既知の不具合や危険な動作をそのまま期待値にしない。正常な現行契約と修正対象を分ける。

| テスト層 | 採用案 | 最初に守るケース |
|---|---|---|
| FE unit/component | 移行先Angularの公式サポートに合わせたVitest + Angular TestBed、HttpTestingController、Material Harness | auth state、HTTP 401/403/timeout、プロジェクト切替、フォームvalidation、role別操作可否、upload cancel/retry、写真並び替え |
| FE E2E | Playwright。PRはmock API、専用stagingでは実APIのsmoke。テストデータ作成/削除は専用tenant | ログイン→案件→場所/対象→写真→Excel、管理者/作業者/閲覧者、期限切れsession、PWA更新時の未保存作業、モバイルviewport |
| BE unit | pytest + pytest-cov、時刻/UUID/外部I/Oを注入 | permission matrix、日付sorting、課金締日25日/26日/月末/年越し/閏年/税丸め、CSV encoding、改ページ・画像位置・結合セル |
| BE adapter | botocore Stubberを基本に、DynamoDB Local等で必要なintegrationのみ | pagination、batch未処理項目、条件付き更新、再試行、同時更新、S3失敗、Cognito例外 |
| API contract | OpenAPI + JSON Schema、FE client生成結果の差分確認 | 正常/認証切れ/権限なし/入力不正/存在なし、pagination、CORS、エラーレスポンス |
| 非同期 | pytestで同じイベントの重複/途中失敗/再試行 | Excel生成、notification、課金の冪等性・再開性 |
| XLSX互換 | ZIP全体のbyte snapshotは避け、workbook構造/セル値/画像数・anchor/印刷設定をassert。代表帳票は目視も行う | 既存basic_1/basic_2、縦横画像、複数ページ、0件・最大件数、日本語文字 |

全体coverageの高い目標値を先に置くより、重要な認可・課金・生成の分岐を網羅し、新規/変更コードのcoverage低下を止める。UIの存在確認だけを大量に増やさない。API/帳票fixtureは個人情報のない合成データを使う。

### 2. 再現できる開発・ビルド

- FE: 目標AngularがサポートするNode LTS、npmまたはpnpmのどちらかを固定。既存npmを継続すれば変更軸を減らせる。`npm ci`、現在形式のlock、`typecheck/lint/test:ci/e2e/build`の標準コマンドを用意。Angular ESLint + Prettierへ移行し、整形だけの差分を意味変更から分離する。
- BE: `pyproject.toml` + uv lockでruntime/devを明示、Ruff lint/format、型検査はmypy等1種類、pytest。自作harvestはsrc配下のinstallable package、第三者依存は環境へ。SAMビルドへのlock export手順を固定し、native依存をLambda互換環境でビルドする。
- 共有: runtime version files、EditorConfig、README、設定例、ローカルfake adapter、トラブルシュート手順。CIと開発のコマンドを一致させる。開発環境から本番接続しなくてもunit/componentが走ることを受入条件にする。

### 3. CI/CD

ホスト環境に合わせたCI（GitHubならActions）をリポジトリに保存する。

PR: lock検証 → lint/format/typecheck → unit/component/contract → production build/SAM build → Playwright smoke。`sam validate --lint`/cfn-lint、依存脆弱性検査・secret検査を追加。ブラウザtrace、JUnit、coverage、artifact SHA/SBOMを保存。Dependabot/Renovateは1つを選び、Angular関連は同一groupで更新する。

リリース: build once → 不変artifactをstagingへ → smoke → 同一artifactをprodへ昇格。短命OIDC、環境別role/parameter、最小IAM、deployment concurrency、明示的なrollbackを用意する。FEはhash asset長期cache、index/ngsw-manifest短期cache、稼働中の旧PWAクライアントが参照するassetを保持。APIはLambda alias/canaryを検討し、error/latency/生成failureのalarmに連動する。CloudFormationのデータ資源置換有無を差分で検査する。

## 実施順と完了条件

1. 計測・再現環境: 既存buildと既知失敗を記録、manifestに不足依存を棚卸し、テストのAWS通信を遮断。完了条件はfresh checkoutで同じ結果が得られること。
2. 保護する契約: 合成fixture、認可/課金/Excel/画像の重点テスト、数本の業務E2Eを整備。壊れた雛形を置換。完了条件は既知の仕様変更をテストが検知すること。
3. CIとpackaging: quality gate、lock、型/lint、SAM再現ビルド。完了条件はCIで成果物まで生成できること。
4. 依存/ランタイム移行: PRを分割し、各段階で重点テストとstaging smoke。課金・生成を通常CRUDと同じ軽さで扱わない。
5. CD/PWA/観測: rollout/rollback、旧asset保持、alertの動作をstagingでリハーサル。READMEを実運用に合わせる。

本調査だけでは本番の現行配布artifact、外部CI、実行時coverage、ブラウザ対応要件、AWSアカウント設定は確定できない。リポジトリ内の事実と運用確認事項を混同しない。
