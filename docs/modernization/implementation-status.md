# モダン化の実装状況

更新日: **2026-10-23 JST**。対象は`harvest-webapp`と`harvest-serverless-api`の今回の作業ツリーです。初回のコミットを調査した[設計書](README.md)・`audits/`・`evidence/`と、ここに記す更新後の実装を区別してください。**設計M01〜M15の全完了や本番移行完了を宣言する資料ではありません。AWSへのデプロイは行っていません。**

## 実装した変更

| 領域 | 今回の実装 | 保持した構成・未完了事項 |
| --- | --- | --- |
| FE依存・ビルド | Node 24、npm 11、Angular 22、Material/CDK 22、TypeScript 6、Amplify 6、RxJS 7。現行application builder、lockfile、ESLint、Vitest、Playwright。旧Protractor/Karma/TSLint設定とAppleDouble除去 | Angular継続。NgModules、Zone、Bootstrap 5、blueimpを保持。standalone/signal/zonelessへの全面置換や全面CSS刷新は未実施 |
| FE型・非同期状態 | strict TypeScript/strictTemplates、modular Cognito adapter、challenge完了待機、token/認証失効時の取消、project切替・logout時の古い応答排除、role切替、通知購読の整理 | 全formsのtyped forms化や全service stateのsignal化は未完了。既存componentは明示的なDefault change detectionで互換維持 |
| ブラウザ設定・PWA | 起動時runtime-config読込・検証、HTTPS必須の本番設定、開発用localhost fallback、外部Google Fontsの自己配信、runtime configのSW cache除外・bypass | CloudFrontの実設定、旧PWAのoffline再開・更新、実端末カメラ、iOS/Android/WebKitの検証は未実施 |
| BE runtime/package | Python 3.14、installable src package、uv.lock、SDKを含む固定依存、Linux x86_64 wheel artifact、SAM CLI隔離、全handlerのartifact単独import検証 | 関数ごとの小さなartifact分割は未実施。共有artifactは約79 MiB展開時。全旧serviceを純粋domain/repository層へ再分割したものではない |
| API境界・認可 | Lambda Powertools/PydanticによるHTTP境界、Cognito JWT検証、tenant/resource所属・法人管理者・role保護、入力上限、秘密値を抑制した例外応答、旧未実装操作の405明示 | 旧クライアント向けraw ID tokenと既存正常経路を維持。実Cognito/IAM/API Gateway上の結合試験は未実施 |
| API契約 | BE route/PydanticからOpenAPI生成、BE CIの再生成差分検査、FE snapshot/hash/provenanceと生成TypeScript、生成ツールのTS5をアプリTS6から隔離 | 手書きservice adapterを保持。legacy responseの一部はopen schema。完全な生成HTTP clientではない。別repo間の自動同期はなく、API変更時に明示syncが必要 |
| データ正確性 | Cognito/DynamoDB/S3のページ処理、条件付き更新/transaction、membershipとowner保護、CSV重複/不完全import回復、課金期間・請求再送、イベント冪等性の是正 | UI/API一覧のcursor方式への全面変更は未実施。内部全件走査の改善とUIの漸進読込は別課題。既存本番データの移行・過去請求の修正は未実施 |
| 写真 | upload session→S3 multipart直接転送→検証/complete、署名scope/サイズ/期限/画像検証、quota・5枚制約・予約回復、complete失敗後の同session再試行 | 旧写真APIを互換経路として保持。実S3 CORS、versioning/lifecycle、現場最大画像・並列負荷の確認は未実施 |
| 帳票 | Python更新に合わせたXLSX/画像/ZIP互換、SQS生成ジョブ・状態API・再送/lease/reconciliation、進捗・download UI | 旧同期生成を保持。実利用者の全template印刷結果、最大データのLambda時間/メモリ測定は未実施 |
| IaC/CI/配布 | 資源parameter、権限の限定、queue/監視/retention、frozen CI、DynamoDB Local、CI artifact保存、両deployのdry-run既定と保存済み成果物使用 | 既存AWS資源inventory/import、OIDC本番deploy、alias/canary、staging切替/rollback rehearsal、SBOM・更新botは未実施 |

## 検証した範囲

通常テストは合成データ・fake/stubを用います。ブラウザE2Eは実Chromiumで画面/Canvas/FormDataを動かし、APIとCognitoをmockし、外部通信を遮断しています。DynamoDB統合テストのみ、digest固定のDynamoDB Localへloopback接続し、各実行の一意tableを作成・削除します。

- FE: lint、strict型検査、Angular templateコンパイル、Vitest **71件成功**、本番build成功、API生成差分一致、[npm audit](validation/frontend-npm-audit.json)既知脆弱性0件。本番buildの初期bundleは1.09 MB、推定転送220.72 kBです。
- Playwright: **10件成功**。未認証redirect、ログイン失敗、登録画面、project一覧/filter/選択保持/空状態、owner/guest切替、JPEG実デコードと1280px縮小、予約→認証headerなしS3 multipart→complete 200/201、complete 500後の再試行で予約/S3各1回、Excel生成202→running→succeeded/download、390px幅の写真操作を検証。
- 配布スクリプト: FE Node test **5件成功**、BE pytest **5件成功**。AWS/SAM CLIをfakeへ差し替え、dry-runの外部操作なし、配布順序、設定・artifact不整合の拒否、失敗exitの伝播、保存済みBE artifactの利用を検証。実クラウドへは接続していません。
- BE: Ruff/format、mypy **65ファイル成功**、pytest **562件成功**（DynamoDB Local **24件を含む**）、OpenAPI差分、CloudFormation lint、lockからのpackage、SAM build、artifactのみからの **18 handler import成功**。管理CLIの10件と配布スクリプトの5件を含みます。Git対象ファイルだけの別ディレクトリから新規frozen installを行い、同じ562件・型検査・format/lint・契約検査が成功しました。
- DynamoDB Local: 実ConditionExpression/transaction/queryでCSV、place/target、upload quota、job claim/lease等を検証。実AWSのIAM・event sourceの配信保証を代替するものではありません。
- 依存監査: Python runtime/dev依存とLambda artifactの実測はAPI側の`docs/runtime-validation.md`と`docs/validation/`を参照。初回監査の脆弱性件数は旧lockの記録です。監査結果は観測時点のadvisoryに依存します。

検証コマンドと現在のCIは各repoのREADME・`.github/workflows/ci.yml`に記載しています。GitHub上のworkflow完走やstaging試験を実施したという意味ではありません。coverage threshold、全画面の視覚比較、全OS/browserのmatrixはまだありません。

管理用shellは共通Python CLIへ整理し、対象環境の明示、dry-run既定、AWS account照合、条件付き書き込みを導入しました。AWS上の新3テーブルはSAM管理とし、旧実験コードは非実行資料へ移しました。詳細はAPI側の`docs/administration.md`を参照してください。

## 独立レビューで追加した是正

- Angular template中の不正演算子によるcompiler/parserのメモリ増大を、最小アプリとの比較で切り分けて修正。メモリ上限の引き上げを完了条件にしていません。
- Angular更新後のchange detectionでログイン結果が描画されない問題、project切替後の権限表示、写真sheetのBootstrap/Material競合による横はみ出しをブラウザで再現・修正。
- 写真completeの失敗時に新しい予約/アップロードを繰り返す経路を修正し、同sessionでcompleteだけ再試行することをE2Eで確認。
- deployとブラウザのruntime config検証条件を揃え、型違いのclient IDや不正URLを配布前に拒否。ngsw hashTableとartifact全fileを照合し、混在/書換済み成果物を拒否。
- CloudFront invalidationを`/*`へ変更し、SPA deep link由来のHTMLとquery付きruntime config/SW取得も対象化。BE deployの暗黙再buildを除去し、保存済みartifactと明示regionを要求。
- OpenAPI exporterのCI gateを追加。FE生成provenanceには実際に使ったgenerator/TypeScriptのversionを記録し、生成toolとmetadataのずれも検出。

## リリース前に残る確認

S3の複数object更新とCloudFront cache失効はatomicではありません。assetを先行配布して旧hash assetを残しても、manifest/index更新中の短い不一致、旧PWAが持つ固定名asset、旧API仕様、新旧runtime configの組合せを完全には保証できません。CloudFront最小TTL=0、deep link設定、CORS、旧PWA更新・offline再開・rollbackをstagingで検証する必要があります。

本番では既存資源名・stream ARN・Cognito・S3 versioning/lifecycle・IAMをinventoryと照合し、変更セットで置換がないことを確認してください。課金/CSV等の新状態には移行手順があり、アプリだけを旧版へ戻してデータも戻ったと扱うことはできません。API側の課金移行資料も併読してください。

今回の成果はローカルで再現・検査できる実装と配布準備です。初回設計の全項目、全画面の再設計、運用切替までを完了扱いにはしていません。
