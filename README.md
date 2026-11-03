> Recovery notice: see [2026-11-01 validation and remaining limitations](docs/recovery-status-2026-11-01.md).

# Harvest web app

工事プロジェクト・撮影対象・写真・Excel帳票を扱うAngularアプリです。APIは隣接する`harvest-serverless-api`で管理します。

最新の差分レビュー・修正・再検証結果は [2026-11-01の自己レビュー](docs/self-review-2026-11-01.md) を参照してください。

更新後の構成・検証結果・残課題は [モダン化の実装状況](docs/modernization/implementation-status.md) を参照してください。[初回調査・設計](docs/modernization/README.md) は更新前のコードを基準とする履歴資料です。

## 開発環境

- Node.js 24 LTS（`.nvmrc`参照）、npm 11
- Angular 22 / Material 22 / TypeScript 6 / Amplify 6
- 開発APIの既定URL: `http://127.0.0.1:3000`

```sh
nvm use
npm ci
npm start
```

ブラウザで `http://localhost:4200` を開きます。API URLとCognito設定は起動時に`/assets/runtime-config.json`から読み込みます。環境ごとの設定を成果物から分離するため、同じビルドをstaging/prodへ配布できます。Cognito client IDは公開設定であり、AWSアクセスキーやclient secretをブラウザ設定に追加しないでください。実環境への接続には対象環境のアカウントが必要です。

`runtime-config.example.json`を参考に環境別JSONを用意します。ローカル開発では`src/assets/runtime-config.json`に配置できます（Git追跡対象外）。公開設定の形:

```json
{
  "apiBaseUrl": "https://api.example.com/v1",
  "auth": {
    "userPoolId": "ap-northeast-1_ExamplePool",
    "userPoolClientId": "exampleclient123"
  }
}
```

本番起動には有効な設定ファイルが必要です。開発時に設定がない場合はローカルAPIとダミーCognito設定を使用します。実認証を使う開発では専用環境の設定を用意してください。

## 検証

```sh
npm run lint
npm run typecheck
npm run api:check
node --test scripts/deploy.test.mjs
npm run test:ci
npm run build
npx playwright install chromium
npm run test:e2e
```

Unit/componentテストはAngularのVitest runner、E2EはPlaywrightです。E2EはAPI/Cognitoをブラウザ内でモックし、合成セッションを使います。AWS資格情報も実APIも不要です。外部通信を遮断した状態で未認証redirect、ログイン失敗、登録フォーム、認証済みプロジェクト一覧・絞り込み・権限別操作・選択の復元・空一覧・作業画面への遷移を検証します。JPEGの実デコード／縮小、予約→S3 multipart→完了、非同期Excel生成とダウンロード表示、toolbarでの権限切替もブラウザから検証します。Cognitoの実認証や本番データとの結合を検証するものではありません。

インストール済みChromiumを使う場合:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Playwrightは開発サーバーを自動起動します。失敗時のtraceとスクリーンショットは`test-results/`、HTMLレポートは`playwright-report/`に保存します。既存サーバーを再利用するときは同じコード・設定で起動していることを確認してください。

## ビルドと配布

`npm run build`は本番設定でビルドします。CIはlockfileに従ったインストール、静的検査、unitテスト、本番ビルド、E2Eを実行し、成果物を保存します。本番デプロイはCIでは実行しません。

配布前にAPI URL、Cognito、CORS、対象S3/CloudFront、更新中クライアントへの互換性を確認してください。PWAの更新時には旧バージョンが参照するhash付きassetを保持し、indexとservice-worker manifestのキャッシュを短くします。`deploy.sh`は既存の`dist/harvest-webapp/browser`成果物を使い、既定では実行予定のコマンドを表示するだけです。

```sh
./deploy.sh --bucket YOUR_BUCKET --distribution-id YOUR_DISTRIBUTION --config /path/to/runtime-config.json
# 対象と差分を確認後に実行する場合だけ --execute を追加
```

`--artifact DIRECTORY`で保存済み成果物を指定できます。配布前にngsw manifestの全hashと成果物の一致を検査します。`--config FILE`は配布先の公開設定JSONを指定し、APIはHTTPSを必須とします。設定ファイルはno-storeで配布し、service workerのキャッシュから除外します。hash付きassetを先に配布し、service-worker manifest、indexの順に更新します。旧assetは削除しません。CloudFrontの`/*`を無効化し、deep link経由のHTMLとquery付き設定も更新対象に含めます。rollbackは保持した以前の成果物と互換な設定を同じ手順で再配布します。

S3の複数object更新はatomicではなく、manifestとindexの更新間やCDN無効化中には一時的な不一致があり得ます。CloudFrontの最小TTLは0とし、SPAのdeep linkをindexへ送る設定、旧PWAからの更新・offline再開・rollbackはstagingで確認してください。旧hash付きassetの保持だけで旧API契約やブラウザ対応まで保証されるものではありません。

hashのない画像などの可変assetは毎回コピーします。同サイズで古いmtimeを持つrollback成果物も確実に戻し、ngswのhashと配布内容がずれることを防ぎます。APIの旧`ServerlessRestApi`/`Prod`から現行`HarvestApi`/環境名stageへの変更はURL互換を保証しないため、API側の`docs/review-cutover-2026-11-01.md`に従い、新APIを確認してからruntime config/custom domain mappingを切り替えます。

## 依存更新

Angular本体・CLI・build・Materialを互換性のある組合せで更新し、lockfileを同じPRに含めます。TypeScript/NodeはAngularの対応範囲に合わせます。更新後は上記の検証をすべて実行してください。`npm audit fix --force`による一括の破壊的更新は避け、機能ごとに互換性を確認します。

2026-11-01時点では、[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)への対応として、ESLint系が使うminimatch 10だけを11.0.3へ限定overrideしています。依存元の指定するmajor範囲を超えるため、ESLint全件・型検査・API型生成の互換性を確認しています。依存元が対応版を採用したらoverrideを外してください。

`npm audit`には開発時のAPI型生成経路（openapi-typescript → Redocly → minimatch 5）にmoderateが3件残っています。high/criticalは0件です。minimatch 5を11へ直接置換すると呼出しAPIが変わり、Redocly 2への強制更新もgeneratorの内部importと互換性がありません。上流の対応を待ち、生成対象は管理下のAPI snapshotに限定します。ブラウザへ配布するアプリの依存経路には含まれません。

## API契約の更新

APIスキーマの変更時は隣接APIリポジトリを使って`npm run api:sync`でsnapshot/provenanceを更新し、`npm run api:generate`で型を生成します。`npm run api:check`は保存されたsnapshotと生成物の一致を検証し、APIリポジトリがなくてもCIで実行できます。生成ツール用TypeScriptは`tools/api-codegen`へ分離し、アプリ側のTypeScriptと独立して管理しています。
