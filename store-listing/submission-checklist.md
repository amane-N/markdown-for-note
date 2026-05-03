# Chrome Web Store 申請チェックリスト

> 提出当日にこのファイルを開きながら順に進める用。

## 事前準備

- [ ] Chrome Web Store デベロッパー登録（初回のみ $5 / 一回限りの登録料）
  - https://chrome.google.com/webstore/devconsole/register
- [x] アイコン 3 サイズ完成（`icons/icon{16,48,128}.png`）
- [ ] スクリーンショット 5 枚完成（`store-listing/screenshots/`）
- [ ] プライバシーポリシーを GitHub Pages に公開し URL を取得
- [ ] 連絡用メールアドレスを確定（公開されるので専用フリーメール推奨）
- [ ] 開発者名「Amane.N」で Web Store デベロッパー登録時の表示名を設定
- [ ] **商標リスク対応の決定**：拡張機能名から「note」を外すか、「for note」形式にするか
- [ ] `privacy-policy.md` の連絡先メール・GitHub URL を実値に置換
- [x] `manifest.json` の `version` が `1.0.0` であることを確認
- [x] ZIP ファイル作成済み（`markdown-for-note-v1.0.0.zip`、44 KB）

## プライバシーポリシーを GitHub Pages に公開する手順

1. GitHub に新規 public リポジトリを作成（リポジトリ名は商標問題回避のため `markdown-for-note` 等を推奨）
2. 作成したリポジトリ直下に `docs/index.md` を作成
3. `store-listing/privacy-policy.md` の内容（連絡先・GitHub URL を実値に置換したもの）をコピペ
4. リポジトリの Settings → Pages で `main` ブランチ・`/docs` フォルダを Pages のソースに設定
5. 公開された URL（例：`https://your-username.github.io/markdown-for-note/`）を控える

## ZIP ファイル作成

`store-listing/build-zip.md` の手順を参照。

## 申請フロー

### Step 1. ログインと新規アイテム
1. https://chrome.google.com/webstore/devconsole にログイン
2. 「**新しいアイテム**」をクリック
3. ZIP ファイル（`markdown-for-note-v1.0.0.zip`）をアップロード

### Step 2. 「ストアの掲載情報」タブ
- [ ] 詳細な説明：`description.md` の「詳細説明」全文をコピペ
- [ ] カテゴリ：仕事効率化
- [ ] 言語：日本語
- [ ] アイコン：`icons/icon128.png` をアップロード
- [ ] スクリーンショット：5枚を順番にアップロード
- [ ] お問い合わせ先メールアドレス：登録メールがプリセット済み

### Step 3. 「プライバシー対応」タブ（最重要）
- [ ] 単一目的：「他のツールやAIで作成したMarkdown形式のテキストをnote.comの執筆画面に装飾を保ったまま貼り付けられるリッチテキスト形式に変換し、クリップボードにコピーする機能を提供します。」
- [ ] 各 Permission の用途を記入：
  - `clipboardWrite`：「変換結果（リッチテキスト形式のHTML）をユーザーのクリップボードに書き込み、note.comの執筆画面に貼り付けられるようにするために使用します。」
  - `storage`：「ユーザーが選択した変換オプション（h1→h2変換のON/OFF、画像URL注釈の有無、自動プレビュー機能の有効化など）をchrome.storage.localに保存し、次回起動時にも設定を保持するために使用します。すべての設定情報はユーザーの端末ローカルにのみ保存され、外部送信は一切行いません。」
- [ ] 「リモートコードを使用していません」を選択（marked.js は同梱しているため）
- [ ] データ収集についての宣言：すべて「収集していません」
- [ ] 認証 3 チェックボックスすべてオン
- [ ] プライバシーポリシー URL を入力

### Step 4. 「配布」タブ
- [ ] 公開設定：公開
- [ ] 配布国：すべての地域（または日本のみ）

### Step 5. 送信
- [ ] 全タブが緑のチェックマーク
- [ ] 「審査のために送信」をクリック

## 提出後

- [ ] 審査ステータスを Developer Dashboard で確認
- [ ] 通常 2〜7 日で審査結果が届く（メール通知あり）
- [ ] 却下された場合は理由を確認し、修正版を再申請

## 商標に関する注意

「note」は note 株式会社の登録商標。タイトルに「note」を含む場合：

- ストア審査時にリジェクトされる可能性あり
- 公開後に削除要請を受けるリスクあり

### 推奨対応
1. タイトルを「**Markdown for note**」のように "for X" 形式に変更
2. 説明文末尾の「サードパーティツールです」明記（既に追加済み）
3. アイコンに note 公式ロゴを使用しない（現状OK）

## 申請後の自己評価レポート（テンプレ）

```
申請日時: YYYY-MM-DD HH:MM
拡張機能名: [最終決定した名称]
バージョン: 1.0.0
ZIP ファイル: markdown-for-note-v1.0.0.zip（44 KB）

提出した素材:
- アイコン: icons/icon16.png, icon48.png, icon128.png
- スクリーンショット: 5枚
- 説明文: store-listing/description.md より
- プライバシーポリシー: https://[your-username].github.io/[repo-name]/

想定審査期間: 2〜7日
```
