/**
 * note-formatter.js
 * marked.parse() の出力HTMLを note.com の執筆画面に貼り付けやすい形式に変換する。
 *
 * 変換ルール:
 *   h1                  → h2          （noteは見出しがh2/h3のみ。h1はページタイトル相当）
 *   h2                  → h2          （そのまま）
 *   h3                  → h3          （そのまま）
 *   h4 / h5 / h6        → <p><strong>...</strong></p>  （太字段落）
 *   strong / em / code  → そのまま
 *   ul / ol / li        → そのまま
 *   blockquote          → そのまま    （note標準の引用として認識）
 *   pre / code(block)   → そのまま    （言語クラスは温存。note側でコードとして扱われる）
 *   a[href]             → そのまま
 *   img                 → 画像URLを示す段落 + 「noteで手動アップロードしてください」注釈
 *   input[type=checkbox]→ ☑ / ☐ の絵文字に置換（GFMタスクリスト対応）
 */
(function () {
  'use strict';

  /** 画像注釈の文言テンプレート */
  function buildImageAnnotation(src, alt) {
    const altText = alt && alt.trim() ? '（' + alt.trim() + '）' : '';
    return '📷 画像URL: ' + src + altText + '（noteで手動アップロードしてください）';
  }

  /**
   * 既存ノードを別タグに付け替える（属性・子ノードはそのまま引き継ぐ）
   */
  function renameTag(node, newTagName) {
    const doc = node.ownerDocument;
    const newEl = doc.createElement(newTagName);
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      newEl.setAttribute(attr.name, attr.value);
    }
    while (node.firstChild) {
      newEl.appendChild(node.firstChild);
    }
    if (node.parentNode) {
      node.parentNode.replaceChild(newEl, node);
    }
    return newEl;
  }

  /**
   * h4/h5/h6 を <p><strong>...</strong></p> に置き換える
   */
  function convertToBoldParagraph(node) {
    const doc = node.ownerDocument;
    const p = doc.createElement('p');
    const strong = doc.createElement('strong');
    while (node.firstChild) {
      strong.appendChild(node.firstChild);
    }
    p.appendChild(strong);
    if (node.parentNode) {
      node.parentNode.replaceChild(p, node);
    }
  }

  /**
   * 親要素が <img> 1つだけを内容として持つ <p> かどうか判定。
   * 兄弟が空白のみのテキストノードや <br> なら "実質的に画像のみ" とみなす。
   */
  function isImageOnlyParagraph(p, img) {
    if (!p || !p.tagName || p.tagName.toLowerCase() !== 'p') return false;
    const children = Array.from(p.childNodes);
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (c === img) continue;
      if (c.nodeType === 3 /* TEXT */) {
        if ((c.textContent || '').trim() !== '') return false;
      } else if (c.nodeType === 1 /* ELEMENT */) {
        const t = c.tagName.toLowerCase();
        if (t !== 'br') return false;
      } else {
        return false;
      }
    }
    return true;
  }

  /**
   * <img> を画像URL注釈段落に置き換える。imagesリストにも追記。
   * 親が「画像だけを含む <p>」なら、ネスト回避のため親 <p> ごと置換する。
   */
  function convertImageToAnnotation(node, images) {
    const doc = node.ownerDocument;
    const src = node.getAttribute('src') || '';
    const alt = node.getAttribute('alt') || '';

    if (src) images.push({ src: src, alt: alt });

    const replacement = doc.createElement('p');
    replacement.className = 'mtn-image-note';
    replacement.textContent = buildImageAnnotation(src, alt);

    const parent = node.parentNode;
    if (parent && isImageOnlyParagraph(parent, node) && parent.parentNode) {
      // 典型ケース: <p><img></p> → <p class="mtn-image-note">...</p>（フラット）
      parent.parentNode.replaceChild(replacement, parent);
    } else if (parent) {
      // それ以外（複数画像が同じ段落に並ぶ等）は img のみを置換
      parent.replaceChild(replacement, node);
    }
  }

  /**
   * <table> を出力から削除する。
   *
   * 背景: note.com の ProseMirror スキーマは <table> ノードを持たず、
   * <pre><code> でラップしてもテーブルらしき内容は段落テキストに展開
   * されてしまう（実機テストで確認）。Markdownの表記法を残しても
   * note 上で見た目が崩れるだけのため、変換段階で完全に取り除き、
   * ユーザーには警告メッセージで除去を通知する方針。
   */
  function removeTable(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  /**
   * GFMタスクリストの <input type="checkbox"> を ☑ / ☐ の絵文字に置換。
   * （noteの貼り付け先では <input> は破棄されるため、テキストとして残す）
   */
  function convertCheckbox(node) {
    const doc = node.ownerDocument;
    const checked = node.hasAttribute('checked') || node.checked === true;
    const span = doc.createElement('span');
    span.textContent = checked ? '☑ ' : '☐ ';
    if (node.parentNode) {
      node.parentNode.replaceChild(span, node);
    }
  }

  /**
   * <img> を出力から削除する。alt は失われるが images 配列には記録される。
   * 設定で「画像URL注釈を入れない」が選択された場合に使用。
   */
  function removeImage(node, images) {
    const src = node.getAttribute('src') || '';
    const alt = node.getAttribute('alt') || '';
    if (src) images.push({ src: src, alt: alt });

    const parent = node.parentNode;
    if (parent && isImageOnlyParagraph(parent, node) && parent.parentNode) {
      parent.parentNode.removeChild(parent);
    } else if (parent) {
      parent.removeChild(node);
    }
  }

  /**
   * 単一ノードに対する変換ルール適用
   * @param {Element} node 変換対象
   * @param {Array} images 抽出された画像情報の蓄積先
   * @param {{convertH1ToH2: boolean, addImageAnnotation: boolean}} options 動作オプション
   */
  function transformNode(node, images, options) {
    if (!node || !node.tagName) return;
    const tag = node.tagName.toLowerCase();

    switch (tag) {
      case 'h1':
        if (options.convertH1ToH2) renameTag(node, 'h2');
        break;
      case 'h4':
      case 'h5':
      case 'h6':
        convertToBoldParagraph(node);
        break;
      case 'img':
        if (options.addImageAnnotation) {
          convertImageToAnnotation(node, images);
        } else {
          removeImage(node, images);
        }
        break;
      case 'input':
        if ((node.getAttribute('type') || '').toLowerCase() === 'checkbox') {
          convertCheckbox(node);
        }
        break;
      case 'table':
        removeTable(node);
        break;
      // h2 / h3 / strong / em / code / pre / ul / ol / li / blockquote / a / p
      // → 何もしない（そのまま）
      default:
        break;
    }
  }

  /**
   * DOMツリーを再帰的に変換する（ボトムアップ：子→自身）
   * - 子から先に処理することで、親が置換されても子の変換結果が壊れない
   * - ライブHTMLCollectionの罠を避けるため Array.from で固定化
   */
  function walk(node, images, options) {
    if (!node) return;
    const children = Array.from(node.children || []);
    for (let i = 0; i < children.length; i++) {
      walk(children[i], images, options);
    }
    transformNode(node, images, options);
  }

  /** デフォルトの動作オプション */
  const DEFAULT_OPTIONS = {
    convertH1ToH2: true,
    addImageAnnotation: true
  };

  /** 与えられた options をデフォルトとマージ（不明キーは無視、未指定キーはデフォルト適用） */
  function resolveOptions(options) {
    const o = options || {};
    return {
      convertH1ToH2: o.convertH1ToH2 !== false,
      addImageAnnotation: o.addImageAnnotation !== false
    };
  }

  /**
   * marked.parse() の出力 HTML を note 形式に変換する。
   * @param {string} html marked.parseの出力（HTML文字列）
   * @param {{convertH1ToH2?: boolean, addImageAnnotation?: boolean}} [options]
   *        convertH1ToH2: h1→h2変換するか（既定true）
   *        addImageAnnotation: <img>を画像URL注釈段落に置換するか（既定true。falseなら<img>削除）
   * @returns {{ html: string, images: Array<{src: string, alt: string}>, warnings: Array<string> }}
   *          html: 変換後のHTML文字列
   *          images: 抽出された画像URLとalt一覧
   *          warnings: 自動変換が走った際の通知コード配列
   *                    'table-removed' = <table>はnote非対応のため出力から削除された
   */
  function formatForNote(html, options) {
    const images = [];
    const warnings = [];
    const resolved = resolveOptions(options);

    if (typeof DOMParser === 'undefined') {
      throw new Error('DOMParser が利用できません');
    }

    // <html><head></head><body>...</body></html> として解釈される
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const body = doc.body;

    // 変換前に <table> の存在を検出（変換後は除去されているため検出不可）
    const hadTable = body.querySelector('table') !== null;

    // body配下の各トップレベル要素から再帰的に変換
    const tops = Array.from(body.children);
    for (let i = 0; i < tops.length; i++) {
      walk(tops[i], images, resolved);
    }

    // 通知: <table> は削除済み（noteのProseMirrorは <table> 非対応のため）
    if (hadTable) {
      warnings.push('table-removed');
    }

    return {
      html: body.innerHTML,
      images: images,
      warnings: warnings
    };
  }

  // 名前空間に公開
  window.MarkdownToNote = window.MarkdownToNote || {};
  window.MarkdownToNote.formatForNote = formatForNote;
  window.MarkdownToNote.DEFAULT_FORMATTER_OPTIONS = DEFAULT_OPTIONS;

  // テスト・将来の差し替え用に内部関数も限定的に公開
  window.MarkdownToNote._noteFormatterInternals = {
    renameTag: renameTag,
    convertToBoldParagraph: convertToBoldParagraph,
    convertImageToAnnotation: convertImageToAnnotation,
    isImageOnlyParagraph: isImageOnlyParagraph,
    convertCheckbox: convertCheckbox,
    buildImageAnnotation: buildImageAnnotation,
    removeTable: removeTable
  };
})();
