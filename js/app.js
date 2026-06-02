/* ============================================================
   VitaalApp — app.js
   LocalStorage · DOM · Events · PWA · i18n
   ============================================================ */

'use strict';

// ── State ────────────────────────────────────────────────────
let lang     = localStorage.getItem('va_lang') || 'nl';
let strings  = {};
let items    = JSON.parse(localStorage.getItem('va_items') || '[]');
let filter   = 'dag'; // dag | week | maand
let activePage = 'home';

// ── Helpers ──────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const save = () => localStorage.setItem('va_items', JSON.stringify(items));
const t = key => strings[key] || key;

function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  const today = dateStr();
  if (iso === today) return 'vandaag';
  const yest = dateStr(new Date(Date.now() - 864e5));
  if (iso === yest) return 'gist.';
  return d.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { day: '2-digit', month: '2-digit' });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function inPeriod(iso) {
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  if (filter === 'dag') return iso === dateStr();
  if (filter === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
    start.setHours(0,0,0,0);
    return d >= start;
  }
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function showToast(msg, type = 'success') {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── i18n ─────────────────────────────────────────────────────
async function loadLang(code) {
  try {
    const r = await fetch(`lang/${code}.json`);
    strings = await r.json();
    applyStrings();
  } catch {
    console.warn('Lang load failed');
  }
}

function applyStrings() {
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  $$('[data-i18n-opt]').forEach(el => {
    const key = el.dataset.i18nOpt;
    el.textContent = t(key);
  });
  // Update active page content
  renderCurrentPage();
}

// ── Navigation ────────────────────────────────────────────────
function navigate(page) {
  activePage = page;
  $$('.page').forEach(p => p.classList.remove('active'));
  $(`#page-${page}`).classList.add('active');
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $(`.nav-item[data-page="${page}"]`).classList.add('active');
  renderCurrentPage();
}

function renderCurrentPage() {
  if (activePage === 'home')         renderHome();
  if (activePage === 'invoer')       renderInvoer();
  if (activePage === 'overzicht')    renderOverzicht();
  if (activePage === 'instellingen') renderInstellingen();
}

// ── Home ──────────────────────────────────────────────────────
function renderHome() {
  // Date header
  const now = new Date();
  const dateEl = document.getElementById('home-date');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  const today = items.filter(i => i.date === dateStr());

  // Stats
  const kcal = today.filter(i => i.cat === 'voeding').reduce((s,i) => s + i.val, 0);
  const fit  = today.filter(i => i.cat === 'fitness').reduce((s,i) => s + i.val, 0);
  const slaap= today.filter(i => i.cat === 'slaap').reduce((s,i) => s + i.val, 0);
  const water= today.filter(i => i.cat === 'water').reduce((s,i) => s + i.val, 0);

  $('#stat-kcal').textContent = kcal || '–';
  $('#stat-fit').textContent  = fit  || '–';
  $('#stat-slaap').textContent= slaap|| '–';
  $('#stat-water').textContent= (water/1000).toFixed(1) || '–';

  const list = $('#home-list');
  const recent = [...today].reverse().slice(0, 5);

  if (!recent.length) {
    list.innerHTML = `<div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      <p>${t('home_no_items')}</p>
    </div>`;
    return;
  }
  list.innerHTML = recent.map(item => itemRowHTML(item)).join('');
  attachDeleteHandlers(list);
}

// ── Item Row HTML ─────────────────────────────────────────────
function itemRowHTML(item) {
  const unit = item.unit || '';
  return `<div class="item-row" data-id="${item.id}">
    <span class="item-dot ${item.cat}"></span>
    <div class="item-info">
      <div class="item-name">${item.omschr}</div>
      <div class="item-cat">${item.cat}</div>
    </div>
    <div class="item-right">
      <div class="item-val">${item.val} <span style="font-size:11px;font-weight:400;color:var(--muted)">${unit}</span></div>
      <div class="item-time">${formatDate(item.date)}</div>
    </div>
    <button class="item-delete" data-id="${item.id}" aria-label="Verwijder">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </div>`;
}

function attachDeleteHandlers(container) {
  container.addEventListener('click', e => {
    const btn = e.target.closest('.item-delete');
    if (!btn) return;
    const id = btn.dataset.id;
    items = items.filter(i => i.id !== id);
    save();
    renderCurrentPage();
  });
}

// ── Invoer ────────────────────────────────────────────────────
function renderInvoer() {
  // Set today's date if empty
  const dateInput = $('#input-datum');
  if (!dateInput.value) dateInput.value = dateStr();
}

function handleSubmit(e) {
  e.preventDefault();
  let valid = true;

  const catEl    = $('#input-cat');
  const omschrEl = $('#input-omschr');
  const waardeEl = $('#input-waarde');

  const resetErr = el => { el.classList.remove('invalid'); el.nextElementSibling?.classList.remove('show'); };
  const showErr  = (el, msg) => {
    el.classList.add('invalid');
    const err = el.nextElementSibling;
    if (err?.classList.contains('error-msg')) { err.textContent = msg; err.classList.add('show'); }
    valid = false;
  };

  resetErr(catEl); resetErr(omschrEl); resetErr(waardeEl);

  if (!catEl.value)                     showErr(catEl,    t('invoer_err_cat'));
  if (!omschrEl.value.trim())           showErr(omschrEl, t('invoer_err_omschr'));
  if (!waardeEl.value || +waardeEl.value <= 0) showErr(waardeEl, t('invoer_err_waarde'));

  if (!valid) return;

  const item = {
    id:     Date.now().toString(),
    date:   $('#input-datum').value || dateStr(),
    cat:    catEl.value,
    omschr: omschrEl.value.trim(),
    val:    +waardeEl.value,
    unit:   $('#input-eenheid').value,
    notitie:$('#input-notitie').value.trim(),
    ts:     new Date().toISOString()
  };

  items.push(item);
  save();

  // Reset form
  $('#invoer-form').reset();
  $('#input-datum').value = dateStr();

  showToast(t('invoer_saved'), 'success');
  navigate('home');
}

// ── Overzicht ─────────────────────────────────────────────────
function renderOverzicht() {
  const filtered = items.filter(i => inPeriod(i.date)).reverse();

  // Per category bars
  const cats = ['fitness', 'voeding', 'slaap', 'water', 'anders'];
  const totals = {};
  cats.forEach(c => totals[c] = filtered.filter(i => i.cat === c).reduce((s,i) => s + i.val, 0));
  const maxVal = Math.max(...Object.values(totals), 1);

  const barList = $('#bar-list');
  barList.innerHTML = cats
    .filter(c => totals[c] > 0)
    .map(c => {
      const count = filtered.filter(i => i.cat === c).length;
      const pct   = Math.round((totals[c] / maxVal) * 100);
      return `<div class="bar-item">
        <div class="bar-meta">
          <span class="bar-name" style="color:var(--${c === 'fitness' ? 'red' : c === 'voeding' ? 'blue' : c === 'slaap' ? 'yellow' : c === 'water' ? 'accent' : 'muted'})">${c.charAt(0).toUpperCase()+c.slice(1)}</span>
          <span class="bar-count">${count}× ${totals[c]}</span>
        </div>
        <div class="bar-track"><div class="bar-fill ${c}" style="width:${pct}%"></div></div>
      </div>`;
    }).join('') || `<p style="color:var(--muted);font-size:13px">${t('overzicht_empty')}</p>`;

  // All items
  const allList = $('#overzicht-list');
  if (!filtered.length) {
    allList.innerHTML = `<div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      <p>${t('overzicht_empty')}</p>
    </div>`;
    return;
  }
  allList.innerHTML = filtered.map(item => itemRowHTML(item)).join('');
  attachDeleteHandlers(allList);
}

// ── Instellingen ──────────────────────────────────────────────
function renderInstellingen() {
  $$('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  const count = items.length;
  const size  = new Blob([localStorage.getItem('va_items') || '']).size;
  $('#storage-info').textContent = `${count} items · ${(size/1024).toFixed(1)} KB`;
}

// ── Service Worker ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.log('SW error', e));
  });
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadLang(lang);

  // Nav
  $$('.nav-item').forEach(n => {
    n.addEventListener('click', () => navigate(n.dataset.page));
  });

  // Form submit
  $('#invoer-form').addEventListener('submit', handleSubmit);
  $('#invoer-annuleer').addEventListener('click', () => navigate('home'));

  // Filter tabs
  $$('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      filter = tab.dataset.filter;
      $$('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderOverzicht();
    });
  });

  // Lang switch
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      lang = btn.dataset.lang;
      localStorage.setItem('va_lang', lang);
      await loadLang(lang);
    });
  });

  // Clear data
  $('#btn-wissen').addEventListener('click', () => {
    if (confirm(t('inst_confirm'))) {
      items = [];
      save();
      showToast(t('inst_wiped'));
      renderCurrentPage();
    }
  });

  // Eenheid auto-update based on category
  $('#input-cat').addEventListener('change', function() {
    const sel = $('#input-eenheid');
    const map = { fitness: 'min', voeding: 'kcal', slaap: 'uur', water: 'ml', anders: '' };
    sel.value = map[this.value] || '';
  });

  navigate('home');
});
