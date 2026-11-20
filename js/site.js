/* MarkdownDiff site — theme, scroll reveal, and the animated demos. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- theme -------------------------------------------------------------
  const html = document.documentElement;
  const sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  const param = new URLSearchParams(location.search).get('theme');
  if (['light', 'dark', 'auto'].includes(param)) localStorage.setItem('mdd-theme', param);
  function applyTheme() {
    const t = localStorage.getItem('mdd-theme') || 'auto';
    html.dataset.theme = t;
    html.classList.toggle('sys-dark', t === 'auto' && sysDark.matches);
    $('#theme-icon').textContent = { auto: '🌓', light: '☀️', dark: '🌙' }[t];
  }
  sysDark.addEventListener('change', () => { applyTheme(); renderMermaid(); });
  $('#theme-toggle').addEventListener('click', () => {
    const order = ['auto', 'light', 'dark'];
    const cur = localStorage.getItem('mdd-theme') || 'auto';
    localStorage.setItem('mdd-theme', order[(order.indexOf(cur) + 1) % order.length]);
    applyTheme();
    renderMermaid();
  });
  applyTheme();

  // ---- i18n (EN / 日本語) -------------------------------------------------
  const YEAR = new Date().getFullYear();
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = YEAR;

  const JA = {
    'nav.features': '機能', 'nav.merge': 'マージ', 'nav.formats': '対応形式', 'nav.get': '導入',
    'hero.eyebrow': '/* あらゆる文書を差分・マージ */',
    'hero.h1': '変更点が<span class="grad">ひと目で</span>わかる。',
    'hero.lede': 'MarkdownDiff は Word・ODT・HTML・LaTeX・EPUB など <a href="https://pandoc.org" target="_blank" rel="noopener">pandoc</a> が読めるあらゆる形式を、きれいな Markdown に正規化して比較します。バイナリのノイズも形式の違いも気にせず、変わった言葉だけを表示します。',
    'hero.cta1': 'はじめる', 'hero.cta2': 'ソースを見る',
    'hero.caption': 'ライブ · 統合表示 · 単語単位のハイライト',
    'feat1.eyebrow': '/* 構文ではなく意味の差分 */',
    'feat1.h2': 'マークアップではなく、意味の差分。',
    'feat1.p': '2 つの <code>.docx</code> は結局 zip 圧縮された XML。<code>git diff</code> では何もわかりません。MarkdownDiff は両方を正規化した Markdown に変換してから比較するので、変わった文・動いた節・編集された数字が見えます。<em>異なる</em>形式どうしでも。',
    'feat1.t1': '統合表示と左右並列表示', 'feat1.t2': '単語単位のハイライト',
    'feat1.t3': '体裁の違い（スマートクォート・改行）は無視',
    'feat1.t4': 'CI 向けの <code>diff</code> 準拠の終了コード',
    'feat2.eyebrow': '/* ライト or ダーク、お好みで */',
    'feat2.h2': 'どんなテーマでも美しく。',
    'feat2.p': 'ドラッグ＆ドロップのローカル Web GUI と、ターミナルに合わせて配色される CLI。ライト・ダーク・ハイコントラスト—すべての色を設定ファイルや <code>--theme-file</code> で自由に編集できます。',
    'shot.light': 'ライト', 'shot.dark': 'ダーク',
    'merge.eyebrow': '/* 3-way マージ */', 'merge.h2': '2 人の編集を統合する。',
    'merge.sub': '共通の元ファイルと 2 つのバージョンを渡すだけ。重ならない変更は自動で統合し、本当の衝突だけを並べて表示します。',
    'rich.eyebrow': '/* テキストだけじゃない */', 'rich.h2': '表も図も、文章だけじゃない。',
    'rich.sub': 'どこまでも Markdown。表はセル単位で差分を取り、Mermaid 図もテキストなのでそのまま差分が取れます。',
    'rich.cap1': 'マークダウンの表 · セル単位で差分', 'rich.cap2': 'Mermaid 図 · ソースとして差分可能',
    'formats.eyebrow': '/* pandoc が読めるすべて */', 'formats.h2': 'ひとつのツールで、あらゆる形式。',
    'formats.sub': 'pandoc が読めるなら、MarkdownDiff で差分が取れます。',
    'get.eyebrow': '/* 2 つの入り口 */', 'get.h2': '1 行でインストール。',
    'get.sub': '<a href="https://pandoc.org/installing.html" target="_blank" rel="noopener">pandoc</a> と Node 18+ が必要です。',
    'get.card1': '⌨ ターミナル · CLI', 'get.card2': '🖥 ブラウザ · GUI', 'get.docs': 'ドキュメントを読む →',
    'foot.tagline': 'あらゆる文書を、きれいな Markdown で差分・マージ。',
    'foot.bmc': 'コーヒーをおごる', 'foot.product': 'プロダクト', 'foot.merge': '3-way マージ',
    'foot.install': 'インストール', 'foot.project': 'プロジェクト', 'foot.builton': '技術スタック',
    'foot.rights': '© ' + YEAR + ' MarkdownDiff · MIT ライセンス',
    'foot.prov': '暫定プレビュー · <b>md.oxge.net</b>',
  };
  const i18nEls = $$('[data-i18n]');
  const originals = new Map();
  i18nEls.forEach((el) => originals.set(el, el.innerHTML));
  function applyLang(lang) {
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = lang === 'ja' && JA[key] != null ? JA[key] : originals.get(el);
    });
    html.lang = lang;
    const btn = $('#lang-toggle');
    if (btn) btn.textContent = lang === 'ja' ? 'EN' : '日本語';
  }
  const langParam = new URLSearchParams(location.search).get('lang');
  if (['en', 'ja'].includes(langParam)) localStorage.setItem('mdd-lang', langParam);
  const initialLang =
    localStorage.getItem('mdd-lang') ||
    ((navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en');
  $('#lang-toggle')?.addEventListener('click', () => {
    const next = html.lang === 'ja' ? 'en' : 'ja';
    localStorage.setItem('mdd-lang', next);
    applyLang(next);
  });
  applyLang(initialLang);

  // ---- mermaid figure ----------------------------------------------------
  const mermaidEl = $('#mermaid-fig');
  const mermaidSrc = mermaidEl ? mermaidEl.textContent : '';
  function mdDark() {
    return html.dataset.theme === 'dark' || (html.dataset.theme === 'auto' && sysDark.matches);
  }
  function renderMermaid() {
    if (!mermaidEl || !window.mermaid) return;
    try {
      mermaidEl.removeAttribute('data-processed');
      mermaidEl.innerHTML = mermaidSrc;
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: mdDark() ? 'dark' : 'default',
        flowchart: { curve: 'basis' },
      });
      window.mermaid.run({ nodes: [mermaidEl] });
    } catch (e) {
      /* leave the source text visible as a graceful fallback */
    }
  }
  if (window.mermaid) renderMermaid();
  else window.addEventListener('load', renderMermaid);

  // Optional Buy Me a Coffee link (set window.MDD_SUPPORT_URL to enable).
  const support = window.MDD_SUPPORT_URL;
  if (support && /^https:\/\//.test(support)) {
    const bmc = $('#bmc');
    bmc.href = support;
    bmc.hidden = false;
  }

  // Format marquee (duplicated for a seamless loop).
  const FORMATS = ['docx', 'odt', 'rtf', 'html', 'markdown', 'rst', 'latex', 'epub',
    'mediawiki', 'org', 'asciidoc', 'textile', 'ipynb', 'json', 'csv', 'opml',
    'man', 'fountain', 'typst', 'docbook', 'jira', 'txt'];
  const mq = $('#marquee');
  if (mq) {
    const make = () => FORMATS.map((f) => `<span class="fmt">${f}</span>`).join('');
    mq.innerHTML = make() + make();
  }

  // Format grid.
  const grid = $('#format-grid');
  if (grid) grid.innerHTML = FORMATS.map((f) => `<span class="fmt">${f}</span>`).join('');

  // ---- scroll reveal -----------------------------------------------------
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }
    },
    { threshold: 0.14 }
  );
  $$('[data-reveal]').forEach((el) => (reduce ? el.classList.add('is-visible') : io.observe(el)));

  // ---- hero diff animation (the "video") --------------------------------
  const heroEl = $('#hero-diff');
  const titleEl = $('#demo-title');
  const SCENES = [
    {
      title: 'report.docx → report.md',
      rows: [
        ['ctx', '## Q3 Summary'],
        ['ctx', ''],
        ['del', 'Revenue grew by ', ['15%', 'del'], '.'],
        ['add', 'Revenue grew by ', ['23%', 'add'], '.'],
        ['ctx', 'Churn held steady.'],
        ['del', 'Next review: ', ['April', 'del'], '.'],
        ['add', 'Next review: ', ['June', 'add'], '.'],
      ],
    },
    {
      title: 'page.html ⟷ page.md',
      rows: [
        ['ctx', '# Release Notes'],
        ['ctx', ''],
        ['del', '- Fixes ', ['several', 'del'], ' bugs'],
        ['add', '- Fixes ', ['12 reported', 'add'], ' bugs'],
        ['add', '- Adds dark mode'],
        ['ctx', '- Performance improvements'],
      ],
    },
    {
      title: 'essay-v1.odt → essay-v2.odt',
      rows: [
        ['ctx', 'In conclusion,'],
        ['del', 'the results were ', ['promising', 'del'], '.'],
        ['add', 'the results were ', ['conclusive and reproducible', 'add'], '.'],
        ['ctx', ''],
        ['ctx', '*Thank you for reading.*'],
      ],
    },
  ];

  function buildRow(spec) {
    const [type, ...parts] = spec;
    const row = document.createElement('div');
    row.className = 'row ' + type;
    const tx = document.createElement('span');
    tx.className = 'tx';
    for (const p of parts) {
      if (Array.isArray(p)) {
        const m = document.createElement('mark');
        m.className = p[1] === 'del' ? 'wd-del' : 'wd-add';
        m.textContent = p[0];
        tx.appendChild(m);
      } else {
        tx.appendChild(document.createTextNode(p));
      }
    }
    row.appendChild(tx);
    return row;
  }

  function playScene(i) {
    const scene = SCENES[i];
    titleEl.textContent = scene.title;
    heroEl.innerHTML = '';
    const rows = scene.rows.map((r) => {
      const el = buildRow(r);
      heroEl.appendChild(el);
      return el;
    });
    rows.forEach((el, idx) => setTimeout(() => el.classList.add('in'), 220 + idx * 260));
    const hold = 220 + rows.length * 260 + 2600;
    setTimeout(() => {
      rows.forEach((el, idx) => setTimeout(() => el.classList.remove('in'), idx * 70));
      setTimeout(() => playScene((i + 1) % SCENES.length), 500 + rows.length * 70);
    }, hold);
  }
  if (heroEl && !reduce) playScene(0);
  else if (heroEl) { // static fallback
    SCENES[0].rows.forEach((r) => { const el = buildRow(r); el.classList.add('in'); heroEl.appendChild(el); });
    titleEl.textContent = SCENES[0].title;
  }

  // ---- merge 3-panel animation ------------------------------------------
  const mergeEl = $('#merge-demo');
  // state: unchanged | ours | theirs | conflict
  const MERGE = [
    { s: 'u', o: '# Proposal', b: '# Proposal', t: '# Proposal' },
    { s: 'u', o: '', b: '', t: '' },
    { s: 'ours', o: 'Budget: $40,000', b: 'Budget: $30,000', t: 'Budget: $30,000' },
    { s: 'u', o: 'Timeline: 6 weeks', b: 'Timeline: 6 weeks', t: 'Timeline: 6 weeks' },
    { s: 'theirs', o: 'Team: 3 people', b: 'Team: 3 people', t: 'Team: 5 people' },
    { s: 'conflict', o: 'Launch in Q2', b: 'Launch in Q1', t: 'Launch in Q3' },
    { s: 'u', o: 'Owner: Taka', b: 'Owner: Taka', t: 'Owner: Taka' },
  ];
  function renderMerge() {
    const cls = (st, who) => {
      if (st === 'conflict') return 'c-conflict';
      if (st === 'ours' && who === 'o') return 'c-ours';
      if (st === 'theirs' && who === 't') return 'c-theirs';
      if (who === 'b' && st !== 'u') return 'c-base';
      return '';
    };
    const cols = { o: 'ours.md', b: 'base.md', t: 'theirs.md' };
    const build = (who, label) => {
      let h = `<div class="pcol"><div class="phead">${label}</div>`;
      for (const r of MERGE) h += `<div class="pline ${cls(r.s, who)}">${esc(r[who]) || ' '}</div>`;
      return h + '</div>';
    };
    mergeEl.innerHTML = build('o', 'ours') + build('b', 'base') + build('t', 'theirs');
    const lines = $$('.pline', mergeEl);
    // reveal row-by-row (3 columns per visual row)
    lines.forEach((el, idx) => {
      const rowIndex = idx % MERGE.length;
      setTimeout(() => el.classList.add('in'), reduce ? 0 : 120 + rowIndex * 180);
    });
  }
  function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
  if (mergeEl) {
    const mio = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { renderMerge(); mio.disconnect(); }
    }, { threshold: 0.3 });
    mio.observe(mergeEl);
  }

  // Nav shadow on scroll
  const nav = $('#nav');
  addEventListener('scroll', () => nav.style.boxShadow = scrollY > 8 ? 'var(--shadow-s)' : 'none', { passive: true });
})();
