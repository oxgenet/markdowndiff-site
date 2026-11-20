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
  sysDark.addEventListener('change', applyTheme);
  $('#theme-toggle').addEventListener('click', () => {
    const order = ['auto', 'light', 'dark'];
    const cur = localStorage.getItem('mdd-theme') || 'auto';
    localStorage.setItem('mdd-theme', order[(order.indexOf(cur) + 1) % order.length]);
    applyTheme();
  });
  applyTheme();

  // ---- misc content ------------------------------------------------------
  $('#year').textContent = new Date().getFullYear();

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
