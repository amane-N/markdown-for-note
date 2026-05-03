// Markdown for note - popup logic

(function () {
  'use strict';

  /** formatForNote() が返す警告コード → ユーザー向け表示文言 */
  const WARNING_MESSAGES = {
    'table-removed': 'GFMテーブルは note 非対応のため出力から削除しました（note の表機能で作成し直してください）'
  };

  /**
   * ユーザー設定のデフォルト値。chrome.storage.local に保存される値の正規形でもある。
   * 既存ユーザーが新しい設定を追加した時に欠ける危険を避けるため、ロード時にこことマージする。
   */
  const DEFAULT_SETTINGS = {
    convertH1ToH2: true,        // h1 を h2 に変換するか
    addImageAnnotation: true,   // <img> を「📷 画像URL: ...」注釈に置換するか
    autoPreview: false          // 入力中に自動プレビューを更新するか
  };

  /** chrome.storage.local の保存キー（ネームスペース） */
  const SETTINGS_STORAGE_KEY = 'mtn_settings_v1';

  /** 現在の設定値（メモリキャッシュ）。loadSettings() で初期化される。 */
  let currentSettings = Object.assign({}, DEFAULT_SETTINGS);

  /**
   * chrome.storage.local から設定を読み込む。
   * chrome.storage が利用不可（テスト/プレビュー環境）でもデフォルト値で動作する。
   */
  function loadSettings() {
    return new Promise(function (resolve) {
      try {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          resolve(Object.assign({}, DEFAULT_SETTINGS));
          return;
        }
        chrome.storage.local.get([SETTINGS_STORAGE_KEY], function (result) {
          const stored = result && result[SETTINGS_STORAGE_KEY];
          // 不完全な保存値があってもデフォルトで埋める
          resolve(Object.assign({}, DEFAULT_SETTINGS, stored || {}));
        });
      } catch (e) {
        console.warn('[Markdown for note] 設定読み込みに失敗、デフォルトを使用:', e);
        resolve(Object.assign({}, DEFAULT_SETTINGS));
      }
    });
  }

  /** 設定を chrome.storage.local に保存する。失敗しても致命的ではない（次回はデフォルト）。 */
  function saveSettings(settings) {
    return new Promise(function (resolve) {
      try {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
          resolve();
          return;
        }
        const data = {};
        data[SETTINGS_STORAGE_KEY] = settings;
        chrome.storage.local.set(data, function () { resolve(); });
      } catch (e) {
        console.warn('[Markdown for note] 設定保存に失敗:', e);
        resolve();
      }
    });
  }

  /** チェックボックスの状態を currentSettings に反映 */
  function applySettingsToUI() {
    const cbH1 = document.getElementById('setting-convert-h1');
    const cbImg = document.getElementById('setting-image-annotation');
    const cbAuto = document.getElementById('setting-auto-preview');
    if (cbH1) cbH1.checked = !!currentSettings.convertH1ToH2;
    if (cbImg) cbImg.checked = !!currentSettings.addImageAnnotation;
    if (cbAuto) cbAuto.checked = !!currentSettings.autoPreview;
  }

  /** 警告コード配列を「⚠️ ...」形式の文字列に整形（複数あれば改行で連結） */
  function formatWarnings(warnings) {
    if (!warnings || !warnings.length) return '';
    return warnings
      .map(function (code) { return '⚠️ ' + (WARNING_MESSAGES[code] || code); })
      .join('\n');
  }

  /**
   * ステータス表示ヘルパー
   * @param {string} message 表示するメッセージ
   * @param {'success'|'error'|'info'} type メッセージ種別。CSSクラスとして使う
   */
  function showStatus(message, type) {
    const el = document.getElementById('status');
    if (!el) return;
    el.textContent = message || '';
    el.className = 'status' + (type ? ' ' + type : '');
  }

  /** ステータス表示をクリア */
  function clearStatus() {
    const el = document.getElementById('status');
    if (!el) return;
    el.textContent = '';
    el.className = 'status';
  }

  /**
   * Markdown文字列をHTMLに変換するラッパー
   * @param {string} md Markdownソース
   * @returns {string} 変換後のHTML
   */
  function markdownToHtml(md) {
    if (typeof marked === 'undefined' || !marked.parse) {
      throw new Error('marked.js が読み込まれていません');
    }
    return marked.parse(md || '', {
      gfm: true,      // GitHub Flavored Markdown（テーブル・取り消し線・タスクリスト）
      breaks: true    // 改行を <br> に変換（noteの段落感に合わせる）
    });
  }

  /**
   * Markdown文字列を「marked.parse → formatForNote」のチェインで note形式HTMLに変換する。
   * 現在の設定値（convertH1ToH2 / addImageAnnotation）を formatForNote に渡す。
   */
  function markdownToNoteHtml(md) {
    if (!window.MarkdownToNote || typeof window.MarkdownToNote.formatForNote !== 'function') {
      throw new Error('note-formatter.js が読み込まれていません');
    }
    const rawHtml = markdownToHtml(md);
    return window.MarkdownToNote.formatForNote(rawHtml, {
      convertH1ToH2: currentSettings.convertH1ToH2,
      addImageAnnotation: currentSettings.addImageAnnotation
    });
  }

  /**
   * HTMLからプレーンテキストを抽出する。text/plainフォールバック用。
   * ブロック要素の境界に改行を入れて自然な段落感を保つ。
   */
  function stripHtml(html) {
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    // <br> と <hr> は単純改行に置換
    doc.body.querySelectorAll('br, hr').forEach(function (el) {
      el.replaceWith(doc.createTextNode('\n'));
    });
    // ブロック要素の末尾に改行を補完
    doc.body.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, blockquote, pre, tr').forEach(function (el) {
      el.appendChild(doc.createTextNode('\n'));
    });
    return doc.body.textContent.replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * リッチテキスト（HTML装飾付き）でクリップボードへコピーする。
   * note.com のエディタは text/html を読み取って装飾を再現するため、
   * navigator.clipboard.writeText() ではなく ClipboardItem を使う必要がある。
   * text/plain も同梱して、メモ帳など装飾非対応アプリへのフォールバックを用意する。
   */
  async function copyRichText(html) {
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('お使いのブラウザはリッチテキストコピーに対応していません（Chrome 86+ が必要）');
    }
    const plainText = stripHtml(html);
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const plainBlob = new Blob([plainText], { type: 'text/plain' });
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': plainBlob
    });
    await navigator.clipboard.write([item]);
  }

  /** ボタンをローディング状態にする（連打防止 + 視覚フィードバック） */
  function setButtonLoading(btn, loadingText) {
    if (!btn) return;
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.textContent;
    }
    btn.disabled = true;
    btn.textContent = loadingText;
  }

  /** ボタンを元の状態に戻す */
  function resetButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  }

  // Sprint 5: 変換 → note形式HTML → クリップボードへリッチテキストコピー
  async function handleConvert() {
    const input = document.getElementById('markdown-input');
    const convertBtn = document.getElementById('convert-btn');
    if (!input) return;

    const md = (input.value || '').trim();
    if (!md) {
      showStatus('Markdownを入力してください', 'error');
      return;
    }

    setButtonLoading(convertBtn, 'コピー中...');
    showStatus('変換してコピー中...', 'info');

    try {
      const result = markdownToNoteHtml(md);
      await copyRichText(result.html);
      const imageNote = result.images.length
        ? '（画像 ' + result.images.length + ' 件はnoteで手動アップロードしてください）'
        : '';
      const warningText = formatWarnings(result.warnings);
      const lines = ['✅ noteに貼り付けてください！' + imageNote];
      if (warningText) lines.push(warningText);
      showStatus(lines.join('\n'), 'success');
    } catch (e) {
      console.error('[Markdown for note] convert error:', e);
      showStatus('❌ コピーに失敗しました: ' + e.message, 'error');
    } finally {
      resetButton(convertBtn);
    }
  }

  /** 表示用の文字数カウント。コードブロック内も含めた最終本文の文字数を返す。 */
  function countCharacters(html) {
    const plain = stripHtml(html);
    // 改行・空白は文字数に含めない（noteエディタの「文字数」表示に近い挙動）
    return plain.replace(/\s+/g, '').length;
  }

  /**
   * 画像URL一覧をUIに描画する。
   * @param {Array<{src: string, alt: string}>} images formatForNoteが返すimages配列
   */
  function renderImageList(images) {
    const area = document.getElementById('image-list-area');
    const list = document.getElementById('image-list');
    const countEl = document.getElementById('image-list-count');
    if (!area || !list) return;

    // 既存のアイテムをクリア（addEventListenerはノードと一緒にGCされる）
    list.textContent = '';

    if (!images || images.length === 0) {
      area.hidden = true;
      if (countEl) countEl.textContent = '';
      return;
    }

    for (let i = 0; i < images.length; i++) {
      list.appendChild(buildImageListItem(images[i]));
    }

    area.hidden = false;
    if (countEl) countEl.textContent = images.length + ' 件';
  }

  /** 画像一覧の1アイテム（li要素）を構築する */
  function buildImageListItem(image) {
    const li = document.createElement('li');
    li.className = 'image-list-item';

    if (image.alt && image.alt.trim()) {
      const altSpan = document.createElement('span');
      altSpan.className = 'image-list-item-alt';
      altSpan.textContent = 'Alt: ' + image.alt.trim();
      li.appendChild(altSpan);
    }

    const row = document.createElement('div');
    row.className = 'image-list-item-row';

    const urlSpan = document.createElement('span');
    urlSpan.className = 'image-list-item-url';
    urlSpan.textContent = image.src;
    row.appendChild(urlSpan);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'image-list-copy-btn';
    btn.textContent = 'URLコピー';
    btn.addEventListener('click', function () {
      copyImageUrl(image.src, btn);
    });
    row.appendChild(btn);

    li.appendChild(row);
    return li;
  }

  /** 画像URLをクリップボードへ。ボタンに一時的なフィードバックを表示する */
  async function copyImageUrl(src, btn) {
    try {
      await navigator.clipboard.writeText(src);
      btn.textContent = '✓ コピー済';
      setTimeout(function () {
        if (btn.isConnected) btn.textContent = 'URLコピー';
      }, 1500);
    } catch (e) {
      console.error('[Markdown for note] image url copy error:', e);
      btn.textContent = 'コピー失敗';
      setTimeout(function () {
        if (btn.isConnected) btn.textContent = 'URLコピー';
      }, 1500);
    }
  }

  // Sprint 6: プレビューはトグル式（開いている状態で再押下すると閉じる）
  // 文字数カウント・注釈表示を追加
  function handlePreview() {
    const input = document.getElementById('markdown-input');
    const previewArea = document.getElementById('preview-area');
    const previewContent = document.getElementById('preview-content');
    const charCountEl = document.getElementById('preview-char-count');
    const previewBtn = document.getElementById('preview-btn');
    if (!input || !previewArea || !previewContent) return;

    // トグル：すでに開いていれば閉じる（画像一覧もまとめて閉じる）
    if (!previewArea.hidden) {
      previewArea.hidden = true;
      previewContent.innerHTML = '';
      if (charCountEl) charCountEl.textContent = '';
      if (previewBtn) previewBtn.textContent = 'プレビュー';
      renderImageList([]);
      clearStatus();
      return;
    }

    const md = (input.value || '').trim();
    if (!md) {
      showStatus('Markdownを入力してください', 'error');
      return;
    }

    try {
      const result = markdownToNoteHtml(md);
      // 自前Markdown のみ前提（XSS現実リスク低）
      previewContent.innerHTML = result.html;
      previewArea.hidden = false;
      if (charCountEl) {
        const count = countCharacters(result.html);
        charCountEl.textContent = '約 ' + count.toLocaleString() + ' 字';
      }
      if (previewBtn) previewBtn.textContent = 'プレビューを閉じる';
      renderImageList(result.images);
      const warningText = formatWarnings(result.warnings);
      const infoLines = [];
      if (result.images.length > 0) {
        infoLines.push('プレビュー表示中（画像 ' + result.images.length + ' 件は変換時に注釈に置換されます）');
      }
      if (warningText) infoLines.push(warningText);
      if (infoLines.length > 0) {
        showStatus(infoLines.join('\n'), 'info');
      } else {
        clearStatus();
      }
    } catch (e) {
      console.error('[Markdown for note] preview error:', e);
      previewArea.hidden = true;
      if (previewBtn) previewBtn.textContent = 'プレビュー';
      renderImageList([]);
      showStatus('プレビュー生成に失敗しました: ' + e.message, 'error');
    }
  }

  /** 設定パネルの開閉トグル */
  function toggleSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    const btn = document.getElementById('settings-btn');
    if (!panel || !btn) return;
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    btn.setAttribute('aria-expanded', String(willOpen));
  }

  /** 設定変更時のハンドラ。チェックボックスの値を currentSettings に反映し永続化する。 */
  function handleSettingsChange() {
    const cbH1 = document.getElementById('setting-convert-h1');
    const cbImg = document.getElementById('setting-image-annotation');
    const cbAuto = document.getElementById('setting-auto-preview');

    currentSettings = {
      convertH1ToH2: cbH1 ? cbH1.checked : DEFAULT_SETTINGS.convertH1ToH2,
      addImageAnnotation: cbImg ? cbImg.checked : DEFAULT_SETTINGS.addImageAnnotation,
      autoPreview: cbAuto ? cbAuto.checked : DEFAULT_SETTINGS.autoPreview
    };
    saveSettings(currentSettings);

    // 開いているプレビューがあれば即時再描画（変換結果が設定で変わるため）
    const previewArea = document.getElementById('preview-area');
    if (previewArea && !previewArea.hidden) {
      // handlePreview はトグルなので、一度閉じた後に開きなおして最新設定を反映
      handlePreview();
      handlePreview();
    }
  }

  /**
   * 自動プレビュー用の debounce 付き入力ハンドラを生成する。
   * - 設定がOFFの間は何もしない
   * - 入力停止から DELAY_MS 経過後に1回だけプレビューを更新
   * - 連続入力中は前回タイマーをキャンセル
   */
  function createAutoPreviewHandler() {
    const DELAY_MS = 500;
    let timer = null;
    return function () {
      if (!currentSettings.autoPreview) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        const input = document.getElementById('markdown-input');
        const previewArea = document.getElementById('preview-area');
        if (!input || !previewArea) return;
        // プレビューが閉じている → 開く / 開いている → 内容更新
        if (previewArea.hidden) {
          handlePreview();
        } else {
          // 開いた状態で再描画したいので、トグルを2回（閉じる→開く）
          handlePreview();
          handlePreview();
        }
      }, DELAY_MS);
    };
  }

  // バージョン表示を manifest から取得して反映（環境によって失敗しても致命的ではないため try-catch）
  function applyVersion() {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.getManifest) return;
      const manifest = chrome.runtime.getManifest();
      const versionEl = document.getElementById('app-version');
      if (versionEl && manifest && manifest.version) {
        versionEl.textContent = 'v' + manifest.version;
      }
    } catch (e) {
      // バージョン表示は装飾なので失敗しても無視
    }
  }

  document.addEventListener('DOMContentLoaded', async function () {
    applyVersion();

    // 設定の読み込み → UIへ反映（チェックボックスの初期状態）
    currentSettings = await loadSettings();
    applySettingsToUI();

    const convertBtn = document.getElementById('convert-btn');
    const previewBtn = document.getElementById('preview-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const input = document.getElementById('markdown-input');

    if (convertBtn) convertBtn.addEventListener('click', handleConvert);
    if (previewBtn) previewBtn.addEventListener('click', handlePreview);
    if (settingsBtn) settingsBtn.addEventListener('click', toggleSettingsPanel);

    // 設定パネル内のチェックボックス変更を監視
    ['setting-convert-h1', 'setting-image-annotation', 'setting-auto-preview'].forEach(function (id) {
      const cb = document.getElementById(id);
      if (cb) cb.addEventListener('change', handleSettingsChange);
    });

    // 入力イベント: ステータスクリア + 自動プレビュー（設定ONの時のみ動作）
    const autoPreview = createAutoPreviewHandler();
    if (input) {
      input.addEventListener('input', clearStatus);
      input.addEventListener('input', autoPreview);
    }
  });

  // テスト/将来の差し替えを楽にするため、内部関数を window 名前空間に最小限だけ公開
  window.MarkdownToNote = window.MarkdownToNote || {};
  window.MarkdownToNote.showStatus = showStatus;
  window.MarkdownToNote.clearStatus = clearStatus;
  window.MarkdownToNote.stripHtml = stripHtml;
  window.MarkdownToNote.copyRichText = copyRichText;
  window.MarkdownToNote.countCharacters = countCharacters;
  window.MarkdownToNote.renderImageList = renderImageList;
  window.MarkdownToNote.formatWarnings = formatWarnings;
  window.MarkdownToNote.loadSettings = loadSettings;
  window.MarkdownToNote.saveSettings = saveSettings;
  window.MarkdownToNote.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
  window.MarkdownToNote.SETTINGS_STORAGE_KEY = SETTINGS_STORAGE_KEY;
})();
