# 配布用 ZIP 作成手順

> Chrome Web Store にアップロードする ZIP を作るコマンド集。
> プロジェクトルート（`manifest.json` がある階層）で実行する。

## 含めるファイル（ホワイトリスト方式）

| 含める | 含めない |
|---|---|
| `manifest.json` | `README.md` |
| `icons/` | `test/` |
| `lib/` | `store-listing/` |
| `popup/` | `Markdown to note 開発計画書（ハーネス設計込み）.txt`（旧称時の名残） |
|  | `*.zip` 既存の ZIP |
|  | `.git/`, `.DS_Store`, `node_modules/` |

## 方法 A: PowerShell `Compress-Archive`（最も簡単）

Windows の標準コマンドで作成。パス区切りが `\` になるが、Chrome Web Store は通常受け付ける。

```powershell
$out = 'markdown-for-note-v1.0.0.zip'
if (Test-Path $out) { Remove-Item $out -Force }
$items = @('manifest.json','icons','lib','popup')
Compress-Archive -Path $items -DestinationPath $out -Force
Get-Item $out | Select-Object Name, Length, LastWriteTime | Format-List
```

検証（中身一覧）：

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'markdown-for-note-v1.0.0.zip').Path)
$zip.Entries | Sort-Object FullName | ForEach-Object { '{0,8} bytes  {1}' -f $_.Length, $_.FullName }
$zip.Dispose()
```

## 方法 B: .NET API でフォワードスラッシュ強制（A で弾かれた場合のフォールバック）

Chrome Web Store のバリデーターがパス区切りでエラーを出した場合に使う。

```powershell
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$out = (Resolve-Path '.').Path + '\markdown-for-note-v1.0.0.zip'
if (Test-Path $out) { Remove-Item $out -Force }

$files = @(
  'manifest.json',
  'icons\icon16.png',
  'icons\icon48.png',
  'icons\icon128.png',
  'lib\marked.min.js',
  'lib\note-formatter.js',
  'popup\popup.html',
  'popup\popup.css',
  'popup\popup.js'
)

$zipStream = [System.IO.File]::Create($out)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

foreach ($f in $files) {
  $absPath = (Resolve-Path $f).Path
  $entryName = $f -replace '\\','/'   # 強制的にフォワードスラッシュ
  $entry = $archive.CreateEntryFromFile($absPath, $entryName)
}

$archive.Dispose()
$zipStream.Close()
Get-Item $out
```

## 方法 C: WSL / Git Bash で `zip` コマンド（zip がインストール済みの場合）

```bash
zip -r markdown-for-note-v1.0.0.zip \
  manifest.json icons lib popup \
  -x "*.DS_Store" "**/.git/*"
unzip -l markdown-for-note-v1.0.0.zip
```

## 提出前最終確認

ZIP を解凍した結果が以下の構成になっていることを確認：

```
markdown-to-note-v1.0.0/
├── manifest.json
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── lib/
│   ├── marked.min.js
│   └── note-formatter.js
└── popup/
    ├── popup.html
    ├── popup.css
    └── popup.js
```

サイズの目安：圧縮後 **30 KB 前後**。これより極端に大きい場合は不要ファイルが混入している。
