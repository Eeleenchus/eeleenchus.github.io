/* Elenchus website: header state, mobile menu, the live theory test, plans, downloads, help contents. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // pleading paper: number the lines down the left margin
  const rail = $('.rail');
  const numberLines = () => { if (!rail || getComputedStyle(rail).display === 'none') return; const n = Math.ceil(document.documentElement.scrollHeight / 32); if (rail.childElementCount === n) return; rail.style.height = n * 32 + 'px'; rail.innerHTML = Array.from({ length: n }, (_, i) => `<i>${i + 1}</i>`).join(''); };
  addEventListener('load', numberLines); addEventListener('resize', numberLines); numberLines();
  // header
  const top = $('.top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const mb = $('.menu-btn');
  if (mb) mb.addEventListener('click', () => { const open = top.classList.toggle('open'); mb.setAttribute('aria-expanded', open); });

  // ── the live theory test (home page) ──
  const demo = $('#demo');
  if (demo) {
    const TH = [
      { code: 'T1', side: 'ours', label: 'Ours', title: 'The former employee set the fire' },
      { code: 'T2', side: 'opp', label: 'Opposing', title: 'The owner burned it for the insurance' },
      { code: 'T3', side: 'alt', label: 'Alternative', title: 'An electrical accident' }
    ];
    const EV = [
      { code: 'E1', title: 'Fire marshal: two separate points of origin', w: 2, r: [1, 1, -2] },
      { code: 'E2', title: 'Policy raised 60% three weeks before', w: 3, r: [0, 2, 0] },
      { code: 'E3', title: 'Owner’s card used 3 miles away at 1:05 a.m.', w: 2, r: [-1, 1, 0] },
      { code: 'E4', title: 'Dock camera disabled two days before', w: 1, r: [1, 1, -1] }
    ];
    const SYM = { 2: '++', 1: '+', 0: '·', '-1': '−', '-2': '−−' };
    const NAME = { 2: 'strongly supports', 1: 'supports', 0: 'is neutral on', '-1': 'undermines', '-2': 'contradicts' };
    const NEXT = { 0: 1, 1: 2, 2: -1, '-1': -2, '-2': 0 };
    const against = (j) => EV.reduce((s, e) => s + (e.r[j] === -1 ? e.w : e.r[j] === -2 ? 2 * e.w : 0), 0);
    demo.innerHTML = `<table><caption class="sr">Evidence rated against three case theories. Activate a mark to change it.</caption>
      <thead><tr><th scope="col">Evidence</th>${TH.map((h, j) => `<th scope="col" data-col="${j}"><span class="side side-${h.side}">${h.label}</span><br>${h.title}</th>`).join('')}</tr></thead>
      <tbody>${EV.map((e, i) => `<tr><th scope="row" style="padding:0"><div class="item"><span class="ex">${e.code}</span><span>${e.title}</span></div></th>${TH.map((h, j) => `<td data-col="${j}"><button class="mark" data-i="${i}" data-j="${j}"></button></td>`).join('')}</tr>`).join('')}</tbody>
      <tfoot><tr><td>Points against<small>fewer is stronger</small></td>${TH.map((h, j) => `<td data-col="${j}"><div class="score" aria-live="polite"></div><div class="meter"><i></i></div></td>`).join('')}</tr></tfoot></table>
      <div class="verdict" aria-live="polite"></div>`;
    const ICON_SCALE = $('#ic-scale')?.innerHTML || '';
    const paint = (bumped) => {
      const sc = TH.map((_, j) => against(j)), min = Math.min(...sc), max = Math.max(1, ...sc);
      const leads = sc.map((v, j) => v === min ? j : -1).filter(j => j >= 0);
      $$('.mark', demo).forEach(b => {
        const e = EV[b.dataset.i], v = e.r[b.dataset.j];
        b.dataset.v = v; b.innerHTML = `<span>${SYM[v]}</span>`;
        b.setAttribute('aria-label', `${e.code} ${NAME[v]} ${TH[b.dataset.j].code}. Activate to change.`);
      });
      if (bumped) { bumped.classList.remove('bump'); void bumped.offsetWidth; bumped.classList.add('bump'); }
      $$('[data-col]', demo).forEach(c => c.classList.toggle('lead', leads.length === 1 && +c.dataset.col === leads[0]));
      $$('tfoot td[data-col]', demo).forEach(c => { const j = +c.dataset.col; $('.score', c).textContent = sc[j]; $('.meter i', c).style.width = Math.round(100 * sc[j] / max) + '%'; });
      const v = $('.verdict', demo);
      if (leads.length > 1) v.innerHTML = `${ICON_SCALE}<span>No single theory leads: ${leads.map(j => TH[j].code).join(' and ')} are tied. Find the evidence that separates them.</span>`;
      else {
        const j = leads[0], second = Math.min(...sc.filter((_, k) => k !== j));
        v.innerHTML = `${ICON_SCALE}<span>The record weighs least against <b>${TH[j].title.toLowerCase()}</b>${second > sc[j] ? `, ${second - sc[j]} ${second - sc[j] === 1 ? 'point' : 'points'} clear of the next theory` : ''}.</span>`;
      }
    };
    demo.addEventListener('click', (ev) => { const b = ev.target.closest('.mark'); if (!b) return; const e = EV[b.dataset.i]; e.r[b.dataset.j] = NEXT[e.r[b.dataset.j]]; paint(b); });
    paint();
  }

  // ── plans ──
  const bill = $('.billing');
  if (bill) {
    const set = (p) => {
      $$('button', bill).forEach(b => b.setAttribute('aria-pressed', b.dataset.p === p));
      $$('[data-yearly]').forEach(el => { el.textContent = p === 'yearly' ? el.dataset.yearly : el.dataset.monthly; });
      const buy = $('#buy-pro'); if (buy) { const url = p === 'yearly' ? window.__checkout?.yearly : window.__checkout?.monthly; if (url) buy.href = url; }
    };
    bill.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) set(b.dataset.p); });
    // Checkout links come from the same config.json the app reads, so prices and links never drift apart.
    fetch('config.json', { cache: 'no-store' }).then(r => r.json()).then(c => {
      window.__checkout = { monthly: c.checkout_monthly, yearly: c.checkout_yearly };
      const buy = $('#buy-pro');
      if (buy && (c.checkout_monthly || c.checkout_yearly)) {
        buy.classList.add('lemonsqueezy-button'); buy.removeAttribute('data-pending');
        const s = document.createElement('script'); s.src = 'https://app.lemonsqueezy.com/js/lemon.js'; s.defer = true; document.head.appendChild(s);
      }
      set($('[aria-pressed="true"]', bill)?.dataset.p || 'monthly');
    }).catch(() => set('monthly'));
  }

  // ── downloads: recommend the right build ──
  const dl = $('.dl-grid');
  if (dl) {
    const ua = navigator.userAgent, plat = (navigator.userAgentData?.platform || navigator.platform || '');
    let rec = /Win/i.test(plat) || /Windows/.test(ua) ? 'win' : /Mac/i.test(plat) || /Mac OS X/.test(ua) ? 'mac-arm' : '';
    if (rec === 'mac-arm') {
      try { const gl = document.createElement('canvas').getContext('webgl'); const d = gl && gl.getExtension('WEBGL_debug_renderer_info'); const r = d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : ''; if (/Intel/i.test(r)) rec = 'mac-intel'; } catch {}
    }
    const card = rec && $(`.dl[data-os="${rec}"]`);
    if (card) { card.classList.add('rec'); card.insertAdjacentHTML('afterbegin', '<span class="rec-tag">Recommended for this computer</span>'); $('.btn', card)?.classList.add('btn-primary'); }
  }

  // ── docs: highlight the section in view ──
  const toc = $('.toc');
  if (toc && 'IntersectionObserver' in window) {
    const links = new Map($$('a[href^="#"]', toc).map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); links.get(e.target.id)?.classList.add('on'); } }), { rootMargin: '-20% 0px -70% 0px' });
    links.forEach((_, id) => { const h = document.getElementById(id); if (h) io.observe(h); });
  }
})();
