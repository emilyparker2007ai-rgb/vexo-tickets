// Shared UI helpers: money, names, price colors, tooltip, bottom sheet, match status.
import { MARKET_LABEL, MARKET_DATE, VENUES } from './data.js';

const ARS = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const TZ = 'America/Argentina/Buenos_Aires';

export const money = (n) => `$${ARS.format(n)}`;
export const kMoney = (n) => (n >= 1e6 ? `$${(n / 1e6).toLocaleString('es-AR', { maximumFractionDigits: 2 })}M` : `$${Math.round(n / 1000)}K`);

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const venueOf = (match) => VENUES[match.venue];
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function priceRange(match) {
  const prices = match.cats.map((c) => c.price);
  return [Math.min(...prices), Math.max(...prices)];
}

export function priceT(match, cat) {
  const [lo, hi] = priceRange(match);
  return hi === lo ? 1 : (cat.price - lo) / (hi - lo);
}

const RAMP = [
  [0, [44, 72, 112]],
  [0.55, [116, 172, 223]],
  [1, [232, 241, 251]],
];

function rampRGB(t) {
  const i = t <= RAMP[1][0] ? 0 : 1;
  const [t0, c0] = RAMP[i];
  const [t1, c1] = RAMP[i + 1];
  const f = (t - t0) / (t1 - t0);
  return c0.map((v, k) => Math.round(v + (c1[k] - v) * f));
}

export function priceColor(match, cat) {
  return cat ? `rgb(${rampRGB(priceT(match, cat)).join(',')})` : '#121a2a';
}

export function barsHTML(match, catId) {
  const cats = [...match.cats].sort((a, b) => a.price - b.price);
  const max = cats[cats.length - 1].price;
  const bars = cats
    .map((c) => `<i class="${c.id === catId ? 'on' : ''}" style="--h:${((c.price / max) * 100).toFixed(1)}%"></i>`)
    .join('');
  return `<div class="bars" aria-hidden="true">${bars}</div>
    <div class="bars__ax"><span>${kMoney(cats[0].price)}</span><span>${kMoney(max)}</span></div>`;
}

export function compareHTML(cat) {
  const saving = cat.market - cat.price;
  if (saving <= 0) return '';
  const pct = Math.round((saving / cat.market) * 100);
  return `<p class="cmp"><b>${pct}% menos</b> que la reventa más barata
    <span class="mono">${MARKET_LABEL} desde ${money(cat.market)} · ${MARKET_DATE}</span></p>`;
}

export function detailHTML(match, block) {
  if (!block.cat) {
    return `<p class="tip__label">${esc(block.name)}</p>
      <p class="tip__pos">${esc(block.position)}</p>
      <p class="tip__closed">${esc(block.unavailable)}</p>`;
  }
  return `<p class="tip__label">${esc(block.name)}</p>
    <p class="tip__pos">${esc(block.position)} · ${esc(block.cat.label)}</p>
    <p class="tip__price">${money(block.cat.price)}</p>
    <p class="tip__unit">precio final por entrada</p>
    <p class="tip__feel">${esc(block.cat.feel)}</p>
    ${barsHTML(match, block.cat.id)}
    ${compareHTML(block.cat)}`;
}

// ---- floating tooltip (mouse) ----
export function showTip(html, x, y) {
  const el = document.getElementById('tip');
  if (el.dataset.html !== html) {
    el.innerHTML = html;
    el.dataset.html = html;
  }
  el.hidden = false;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const pad = 16;
  let left = x + 20;
  let top = y + 20;
  if (left + w > window.innerWidth - pad) left = x - w - 20;
  if (top + h > window.innerHeight - pad) top = Math.max(pad, y - h - 20);
  el.style.transform = `translate3d(${Math.max(pad, left)}px, ${top}px, 0)`;
}

export function hideTip() {
  document.getElementById('tip').hidden = true;
}

// ---- phones: in-app browsers, overlays that own a history entry, swipe to dismiss ----
export const coarsePointer = () => window.matchMedia('(pointer: coarse)').matches;
export const inAppBrowser = () => /Instagram|FBAN|FBAV|FB_IAB|Line\//.test(navigator.userAgent);
const inFrame = () => { try { return window.top !== window; } catch { return true; } };

// On phones a wa.me link must open WhatsApp in place (universal link / intent), not a blank tab.
export function tuneWaLink(a) {
  if (coarsePointer() && !inFrame()) a.removeAttribute('target');
}

export function pushOverlay(name) {
  try { history.pushState({ ...(history.state || {}), overlay: name }, ''); } catch { /* sandboxed */ }
}

export function swipeToClose(card, onClose) {
  let y0 = null;
  let dy = 0;
  card.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || card.scrollTop > 0 || e.target.closest('button, a, input, .stepper')) return;
    y0 = e.clientY;
    dy = 0;
  });
  card.addEventListener('pointermove', (e) => {
    if (y0 === null) return;
    dy = Math.max(0, e.clientY - y0);
    card.style.transform = `translateY(${dy}px)`;
    card.style.transition = 'none';
  });
  const end = () => {
    if (y0 === null) return;
    card.style.transition = '';
    card.style.transform = '';
    if (dy > 90) onClose();
    y0 = null;
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

// ---- bottom sheet ----
let sheetReturn = null;
let sheetThen = null;
let sheetOpen = false;

export const isSheetOpen = () => sheetOpen;

function hideSheet() {
  const el = document.getElementById('sheet');
  sheetOpen = false;
  el.classList.remove('is-open');
  document.documentElement.classList.remove('is-locked');
  document.removeEventListener('keydown', sheetKeys);
  setTimeout(() => { if (!sheetOpen) el.hidden = true; }, 250);
  sheetReturn?.focus?.({ preventScroll: true });
  sheetReturn = null;
}

// then: runs after the sheet is gone (and after its history entry is popped).
export function closeSheet({ fromPop = false, then = null } = {}) {
  if (!isSheetOpen()) { then?.(); return; }
  if (then) sheetThen = then;
  if (!fromPop && history.state?.overlay === 'sheet') { history.back(); return; }
  hideSheet();
  const cb = sheetThen;
  sheetThen = null;
  cb?.();
}

function sheetKeys(e) {
  if (e.key === 'Escape') closeSheet();
}

// body and actions are HTML; onAction(act, target, card) handles [data-act] clicks inside the sheet.
export function openSheet({ body, actions = '', label = 'Detalle de la ubicación', onAction = null, onMount = null }) {
  const el = document.getElementById('sheet');
  const reopening = isSheetOpen();
  sheetReturn = reopening ? sheetReturn : document.activeElement;
  el.innerHTML = `<div class="sheet__card" role="dialog" aria-modal="true" aria-label="${esc(label)}">
      <button class="sheet__grab" type="button" data-act="close" aria-label="Cerrar"></button>
      <div class="sheet__body">${body}</div>
      <div class="sheet__actions">${actions}<button class="btn btn--ghost" type="button" data-act="close">Cerrar</button></div>
    </div>`;
  const card = el.querySelector('.sheet__card');
  sheetOpen = true;
  el.hidden = false;
  document.documentElement.classList.add('is-locked');
  document.addEventListener('keydown', sheetKeys);
  if (!reopening) pushOverlay('sheet');
  requestAnimationFrame(() => {
    el.classList.add('is-open');
    el.querySelector('.sheet__actions [data-act]')?.focus({ preventScroll: true });
  });
  swipeToClose(card, () => closeSheet());
  onMount?.(card);
  el.onclick = (e) => {
    if (e.target === el) { closeSheet(); return; }
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'close') { closeSheet(); return; }
    onAction?.(btn.dataset.act, btn, card);
  };
}

// Calendar day number in Argentina time, so "Faltan N días" counts days, not 24 h blocks.
function dayIndex(t) {
  const [y, m, d] = new Date(t).toLocaleDateString('en-CA', { timeZone: TZ }).split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 864e5;
}

function daysUntil(match, now) {
  return dayIndex(new Date(match.kickoff).getTime()) - dayIndex(now);
}

export function matchStatus(match, now) {
  const k = new Date(match.kickoff).getTime();
  if (now >= k + 2 * 3600e3) return 'finished';
  if (now >= k) return 'live';
  const days = daysUntil(match, now);
  if (days <= 0) return 'today';
  return days === 1 ? 'tomorrow' : 'upcoming';
}

export function hourOf(match) {
  return new Date(match.kickoff).toLocaleTimeString('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
}

export function statusText(match, now) {
  const st = matchStatus(match, now);
  if (st === 'finished') return match.result ? `Terminó ${match.result.arg} a ${match.result.rival}` : 'Ya se jugó';
  if (st === 'live') return 'Se está jugando ahora';
  if (st === 'today') return `Es hoy, a las ${hourOf(match)}`;
  if (st === 'tomorrow') return `Es mañana, a las ${hourOf(match)}`;
  return `Faltan ${daysUntil(match, now)} días`;
}

export function whenText(match, { long = false } = {}) {
  const d = new Date(match.kickoff);
  const wd = d.toLocaleDateString('es-AR', { timeZone: TZ, weekday: long ? 'long' : 'short' }).replace('.', '');
  const dm = d.toLocaleDateString('es-AR', { timeZone: TZ, day: 'numeric', month: 'numeric' });
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${dm} · ${hourOf(match)}`;
}

export function flagImg(code, cls = 'flag') {
  const names = { arg: 'Argentina', bol: 'Bolivia', bfa: 'Burkina Faso', ben: 'Benín' };
  return `<img class="${cls}" src="img/flags/${code}.svg" alt="Bandera de ${names[code]}" width="60" height="40">`;
}
