# Chrome Web Store 提出物一式

Sprint 10 で生成した、Chrome Web Store に提出するための素材集。
ストアアップロード時にここから順に開いてコピペ・参照する。

## ファイル一覧

| ファイル | 内容 | 用途 |
|---|---|---|
| `description.md` | アイテム名・概要・詳細説明・カテゴリ | Web Store「店舗情報」タブにコピペ |
| `privacy-policy.md` | プライバシーポリシー本文 | GitHub Pages 等に公開し URL を提出 |
| `assets-checklist.md` | アイコン3サイズ・スクショ5枚の制作ガイド | Canva/Figma 制作時に参照 |
| `build-zip.md` | 配布用 ZIP 作成コマンド | 提出直前に実行 |
| `submission-checklist.md` | デベロッパーコンソールでの申請手順 | 提出当日に開く |

## 必要な人間（手動）作業

Claude Code では作れない成果物：

1. **アイコン制作**（Canva 推奨）— `icons/` 配下を正式版に置換
2. **スクリーンショット 5 枚**（1280×800）— `screenshots/` に保存
3. **プライバシーポリシーの公開**（GitHub Pages 等）— URL を取得
4. **`Your Name` / `@your_handle` / プレースホルダ URL の置換**（Sprint 9 の指摘）
5. **Chrome Web Store デベロッパー登録**（初回 $5）
6. **Web Store Developer Console での申請**

## 既に完成している成果物

- `description.md` — タイトル候補・短説明（102文字）・詳細説明（約920文字）
- `privacy-policy.md` — Markdown 形式・GitHub Pages にそのまま公開可
- `markdown-for-note-v1.0.0.zip` — プロジェクトルートに配置済み（30 KB）

## 申請までの推奨順序

1. アイコン3サイズを制作・差し替え
2. プレースホルダ（名前・URL等）を実値に置換
3. ZIP を再ビルド（`build-zip.md` 方法A）
4. ローカル Chrome に「パッケージ化されていない拡張機能」として読み込み、最終動作確認
5. スクリーンショット 5 枚撮影
6. プライバシーポリシーを GitHub Pages に公開
7. Web Store Developer Console で申請
