# 配布・CIレビューと最終ブラウザ再検証

実測日: **2026-11-01 UTC**。今回は復元統合ディレクトリではなく、修正後の`/workspace/harvest-webapp`を検証しています。旧版比較元はFE`547e928`・BE`66d7d18`です。以前の履歴上の結果と、同日の復元直後の検証を今回の結果と混同しないでください。

## 今回修正した配布の不具合

FEのhashなし可変assetを`aws s3 sync`で配布すると、rollback元のファイルが現行S3 objectと同サイズ・古いmtimeの場合に転送されず、新しい内容が残ります。ngsw manifestが古い内容のhashを期待するため、表示・PWAの整合性が崩れます。可変assetだけを`aws s3 cp --recursive`へ変更し、hash付きimmutable assetのsync、worker/config/manifest/indexのno-store、旧assetの保持を維持しました。

fake S3でこのsame-size/mtime判断を再現し、修正前のsync相当では新しい画像が残ってテストが失敗すること、修正後は古い内容へ戻ることを確認しました。配布テストは **6件成功** です。実S3へは接続していません。

BEではビルド成功後にコードとbuilt SAM templateのSHA-256 manifestを作成し、deploy前の欠落・改変・混在検証を追加しました。manifestなしの旧保存artifactは再buildが必要です。さらに明示的な`EnvironmentName`を必須とし、既存tableのStreams不一致を管理CLIが成功扱いしないよう修正しました。関連するBE重点テストは **32件成功**。新manifestを使った実ビルドは成功し、**65ソースがartifactと一致、18 handlerがartifact単独でimport成功、3,388ファイルのmanifestがimport前後とも一致**しました。bytecode生成を無効にして検証しています。API repoの`docs/validation/review-build-2026-11-01.json`が実測記録です。

CIはこのmanifestを生成・保存し、両repoとも配布artifactがない場合はuploadを失敗させます。workflowをGitHub上で実行したという意味ではありません。

## 最終E2E実測

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

**10件成功、0失敗、57.5秒**。Node24.19.0、Playwright1.64.1、既存Chromium154.0.8037.57を使用しました。最終production buildの終了後に開始し、最新の元repo sourceからPlaywrightが開発サーバーを起動しています。

対象は未認証redirect、ログイン失敗、project一覧/filter/選択保持/空状態、owner/guest権限切替、実JPEG縮小、予約→認証headerなしS3 multipart→complete200/201、complete失敗後の同session再試行、生成jobの202→running→succeeded/download、390px幅の写真操作です。[全件ログ](review-e2e-2026-11-01.log)と[実測・hash記録](deployment-review-2026-11-01.json)を保存しています。

復元直後に見つけたtoolbarの終了アニメーション待機不足は既に修正されており、今回そのassertを削除・弱化していません。その初回失敗と新修正の記録は [復元時の検証](browser-recovery-2026-11-01.md) に分離しています。

## 確認の限界

E2EはAPI/Cognitoをmockし外部通信を遮断、service workerも無効にしています。Cognitoの実認証、実S3 CORS/IAM、PWAのoffline再開・更新、CloudFront cache、実APIとブラウザの結合は保証しません。

旧APIのimplicit `ServerlessRestApi`/`Prod`から明示`HarvestApi`/環境名stageへの変更はAPI ID・URLの維持を保証しません。旧新APIの隔離staging、custom domain/runtime configの切替、旧writer/event処理のdrainと互換rollbackが必要です。API repoの`docs/review-cutover-2026-11-01.md`に具体的な順序を記載しました。実AWSのinventory、変更セット、配布・公開はこのレビューでは実施していません。
