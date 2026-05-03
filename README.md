# Markdown for note

他のエディタやAIで書いたMarkdownテキストを、note.comの執筆画面にそのまま貼り付けられる形式に自動変換するChrome拡張機能。

## 概要

- ChatGPT/Claudeで書いた記事をnoteに転載するときの整形手間をゼロに
- 見出し・太字・リスト・リンクを自動で装飾付きコピー
- 完全無料・永久無料
- 通信ゼロ（クライアント完結）
- Manifest V3対応

## 開発状況

Sprint 1〜10 完了、Chrome Web Store 申請準備中。

開発計画書: `Markdown to note 開発計画書（ハーネス設計込み）.txt`（旧称時の名残）

## ディレクトリ構成

```
markdown-for-note/
├── manifest.json
├── icons/           # アイコン（16/48/128px、ソースの2.png/3.pngを含む）
├── popup/           # ポップアップUI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── lib/             # marked.js / note-formatter.js
├── store-listing/   # ストア提出物（説明文・プライバシーポリシー等）
├── test/            # 動作確認用サンプルMarkdown
└── README.md
```

## 開発者向け

### Chromeへの読み込み手順

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このリポジトリのルートフォルダを選択
