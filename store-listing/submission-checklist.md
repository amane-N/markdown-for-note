# Chrome Web Store 申請チェックリスト

> 提出当日にこのファイルを開きながら順に進める用。

## 確定情報（申請画面で使う）

| 項目 | 値 |
|---|---|
| 拡張機能名 | **Markdown for note** |
| バージョン | 1.0.0 |
| 開発者名 | Amane.N |
| 連絡用メール | amane.n4802@gmail.com |
| プライバシーポリシー URL | https://amane-n.github.io/markdown-for-note/ |
| GitHub リポジトリ | https://github.com/amane-N/markdown-for-note |
| 配布 ZIP | markdown-for-note-v1.0.0.zip（44 KB） |

## 事前準備

- [ ] Chrome Web Store デベロッパー登録（初回のみ $5 / 一回限りの登録料）
  - https://chrome.google.com/webstore/devconsole/register
- [x] アイコン 3 サイズ完成（`icons/icon{16,48,128}.png`）
- [x] スクリーンショット 4 枚完成（`store-listing/screenshots/01〜04.png`、各1280×800）
- [x] プライバシーポリシーを GitHub Pages に公開し URL を取得
- [x] 連絡用メールアドレスを確定（amane.n4802@gmail.com）
- [x] 開発者名を「Amane.N」に決定（デベロッパー登録時に設定）
- [x] **商標リスク対応の決定**：拡張機能名を「Markdown for note」（"for X" 形式）に決定
- [x] `privacy-policy.md` の連絡先メール・GitHub URL を実値に置換
- [x] `manifest.json` の `version` が `1.0.0` であることを確認
- [x] ZIP ファイル作成済み（`markdown-for-note-v1.0.0.zip`、44 KB）

## プライバシーポリシーを GitHub Pages に公開する手順 ✅ 完了済み

公開URL：**https://amane-n.github.io/markdown-for-note/**

（参考のため手順を残します）

1. GitHub に新規 public リポジトリを作成（`markdown-for-note`）
2. 作成したリポジトリ直下に `docs/index.md` を作成
3. `store-listing/privacy-policy.md` の内容（連絡先・GitHub URL を実値に置換したもの）をコピペ
4. リポジトリの Settings → Pages で `main` ブランチ・`/docs` フォルダを Pages のソースに設定
5. 公開された URL を控える

## ZIP ファイル作成 ✅ 完了済み

`markdown-for-note-v1.0.0.zip`（44 KB、9ファイル）。再ビルドが必要な場合は `store-listing/build-zip.md` の手順を参照。

## 申請フロー（Developer Console での操作）

### Step 1. ログインと新規アイテム
- [ ] https://chrome.google.com/webstore/devconsole にログイン
- [ ] 「**新しいアイテム**」をクリック
- [ ] ZIP ファイル（`markdown-for-note-v1.0.0.zip`）をアップロード

### Step 2. 「ストアの掲載情報」タブ
- [ ] 詳細な説明：`description.md` の「詳細説明」全文をコピペ
- [ ] カテゴリ：仕事効率化
- [ ] 言語：日本語
- [ ] アイコン：`icons/icon128.png` をアップロード
- [ ] スクリーンショット：4枚を以下の順でアップロード
  - `screenshots/01-input.png`（入力画面・ヒーロー）
  - `screenshots/02-result.png`（変換結果）
  - `screenshots/03-preview.png`（プレビュー）
  - `screenshots/04-settings.png`（設定）
- [ ] お問い合わせ先メールアドレス：amane.n4802@gmail.com（登録メールがプリセット済み）

### Step 3. 「プライバシー対応」タブ（最重要）
- [ ] 単一目的：「他のツールやAIで作成したMarkdown形式のテキストをnote.comの執筆画面に装飾を保ったまま貼り付けられるリッチテキスト形式に変換し、クリップボードにコピーする機能を提供します。」
- [ ] 各 Permission の用途を記入：
  - `clipboardWrite`：「変換結果（リッチテキスト形式のHTML）をユーザーのクリップボードに書き込み、note.comの執筆画面に貼り付けられるようにするために使用します。」
  - `storage`：「ユーザーが選択した変換オプション（h1→h2変換のON/OFF、画像URL注釈の有無、自動プレビュー機能の有効化など）をchrome.storage.localに保存し、次回起動時にも設定を保持するために使用します。すべての設定情報はユーザーの端末ローカルにのみ保存され、外部送信は一切行いません。」
- [ ] 「リモートコードを使用していません」を選択（marked.js は同梱しているため）
- [ ] データ収集についての宣言：すべて「収集していません」
- [ ] 認証 3 チェックボックスすべてオン
- [ ] プライバシーポリシー URL：`https://amane-n.github.io/markdown-for-note/` を入力

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

## 商標に関する注意 ✅ 対応済み

「note」は note 株式会社の登録商標。タイトルに「note」を含む場合：

- ストア審査時にリジェクトされる可能性あり
- 公開後に削除要請を受けるリスクあり

### 実施済み対応
- [x] タイトルを「**Markdown for note**」（"for X" 形式）に変更
- [x] 説明文末尾に「サードパーティツールです」明記（`description.md`）
- [x] アイコンに note 公式ロゴを使用していない（独自の Md→n / M ロゴ）

## 申請後の自己評価レポート（テンプレ）

```
申請日時: YYYY-MM-DD HH:MM
拡張機能名: Markdown for note
バージョン: 1.0.0
ZIP ファイル: markdown-for-note-v1.0.0.zip（44 KB）

提出した素材:
- アイコン: icons/icon16.png, icon48.png, icon128.png
- スクリーンショット: 4枚（01-input/02-result/03-preview/04-settings）
- 説明文: store-listing/description.md より
- プライバシーポリシー: https://amane-n.github.io/markdown-for-note/
- 連絡先: amane.n4802@gmail.com

想定審査期間: 2〜7日
```
