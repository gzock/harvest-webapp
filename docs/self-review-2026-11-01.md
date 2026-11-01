# 復元後の画面・API互換性レビュー（2026-11-01 UTC）

旧版 `547e928` と復元版 `c19e57a` を比較し、画面・状態管理、API契約・依存、配布を並列レビューした。コード修正は元リポジトリへ反映し、ローカルコミットへ保存した。

## 修正した問題

| 問題 | 修正・検証 |
| --- | --- |
| Material更新後、パスワード表示checkboxと実際のinput typeが一致しない | ngModelとclick処理の二重管理を除去し、単一状態からtypeを決定。実DOMクリックの回帰テストで確認 |
| メンバー一覧がCognito属性より早く到着すると設定画面でTypeError | 明示的な未取得状態を持ち、取得まで役割変更を無効化。取得後の描画、破棄後の購読解除も検証 |
| project切替後に旧projectの帳票ダウンロードが開始される／破棄後のtemplate削除応答が画面を更新する | scope終了で関連購読を解除。ダイアログ終了処理にも適用 |
| 法人関連APIの旧レスポンス形式が変わっていた | バックエンドを旧形式へ戻し、OpenAPI snapshot／provenance／TypeScript型を再生成。既存の一覧配列・法人document全体の契約を明記 |
| 同サイズで古いmtimeの可変assetがrollbackで転送されない | 可変assetを再帰copyし、hash asset保存とmanifest/index配布順序を維持。旧動作で失敗するfake S3回帰を追加し、別担当も差分レビュー |

画面の新しい4回帰は修正前に失敗することを確認した。全**75テスト／16ファイル**、strict app/spec型検査、ESLint、本番ビルド（strictTemplates含む）が成功した。本番ビルドの初期推定転送量は220.69kB。API生成整合検査も成功。

ブラウザE2Eは **10件成功（57.5秒）**。配布スクリプトの **6テスト**も成功。[最終配布検証](validation/deployment-review-2026-11-01.md)と[E2Eログ](validation/review-e2e-2026-11-01.log)に記録した。E2Eは実Chromium、API/Cognitoはmock、外部通信とservice workerは遮断している。

## 依存と残る確認

minimatchの利用APIを確認し、互換性を検証できた開発ツールだけ更新した。npm auditはmoderate **20→3件**、high/critical 0件。本番依存の `npm audit --omit=dev` は0件。残るRedocly/API型生成依存は強制更新すると生成が壊れるため残し、理由をREADMEに記録した。

これは全画面・全実端末・実AWSとの互換性を証明するものではない。旧PWAのoffline再開や更新、実Cognito、API GatewayのURL切替、実S3、帳票の印刷結果はstagingでの確認が必要。バックエンドの `docs/self-review-2026-11-01.md` と `docs/review-cutover-2026-11-01.md` に、データ・認可・帳票の修正と移行条件を記載した。

今回の変更はローカルに保存し、リモートへの追加pushやPR作成、本番配布は行っていない。
