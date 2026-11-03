# 復元統合版のブラウザ・配布テスト再検証

実測日: **2026-11-01 UTC**。検証対象は隔離統合版`/workspace/recovered/integration/harvest-webapp`です。2026-10-23の履歴上の成功記録を転記した結果ではありません。元リポジトリへの変更、実AWS接続、実API接続はこの検証では行っていません。

| 検証 | 今回の結果 |
| --- | --- |
| 配布スクリプト | 5成功、0失敗、1.54秒 |
| 初回Chromium E2E | 9成功、1失敗。toolbarでguestからownerへ戻す操作がtimeout |
| テスト同期修正後のtoolbar重点検証 | 3回連続成功、17.5秒 |
| 修正後のChromium E2E全体 | **10成功、0失敗、44.3秒** |

環境はNode24.19.0/npm11.9.0/Playwright1.64.1、既存`/usr/bin/chromium`154.0.8037.57です。ブラウザの追加downloadは不要でした。別担当のproduction build終了を確認してからE2Eを開始し、Playwrightがこの統合版の開発サーバーを起動しました。

## 初回失敗と新たな修正

初回はowner→guestの選択と権限非表示まで成功し、guest→ownerへ戻す際、次のproject selectをクリックしてもoptionが表示されませんでした。traceにはguest選択直後のpanelに`mat-select-panel-exit`が残り、その約40ms後に次のクリックを開始したこと、クリック後も`aria-expanded=false`であったことが記録されています。Material22のselectはexit animationの終了時にoverlayをdetachするため、画面の権限表示更新だけを待つテストでは閉じる途中のoverlayと次のクリックが競合します。

統合版の`e2e/harvest.spec.ts`に、次のselectクリック前に`getByRole('listbox', { includeHidden: true })`のDOM要素が0件になるまで待つ処理を追加しました。固定sleep、timeout増加、試験retry、権限assertの削除は行っていません。アプリケーションsourceは変更していません。

これは**復元後に実測で見つけたテスト同期の新修正**です。履歴から復元した`/workspace/recovered/quality`の原本には変更を加えていません。[差分](browser-recovery-fix.patch)と[初回失敗ログ](browser-recovery-initial-failure.txt)を保存し、失敗を単なる再実行成功で上書きしていません。

## 検証範囲と限界

全10件には未認証redirect、ログイン失敗、project一覧/filter/選択保持/空状態、owner/guest権限切替、JPEGの実デコードと縮小、予約→認証headerなしS3 multipart→complete200/201、complete500後に同sessionで再試行、Excel生成202→running→succeeded/download、390px幅の写真操作を含みます。配布テストはfake AWS CLIによりdry-run、設定検証、assetとPWA hash不一致の拒否、配布順序、失敗exit伝播を検証します。

API/Cognitoはmockし、外部通信を遮断しています。service workerも無効化しているため、本番PWA更新・offline再開・CloudFront・実Cognito/S3/IAMの確認を代替するものではありません。統合時の依存lockは再生成されており、過去のartifactとのbyte単位の一致を保証する結果ではありません。

## 再現・証拠

```sh
node --test scripts/deploy.test.mjs
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

- [実測結果JSON](browser-recovery-results.json)
- [全10件の最終ログ](browser-recovery-final.txt)
- [検証対象ファイルのSHA-256](browser-recovery-source-hashes.json)
- 初回trace/screenshot、重点試験ログ、最新画面: `/workspace/recovered/validation/quality/`

最後のworkspaceパスはこの検証環境の保全先です。Git checkout後に自動で存在するファイルとしては扱わないでください。
