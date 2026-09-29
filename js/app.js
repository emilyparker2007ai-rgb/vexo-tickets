// Vexo Tickets: pick the match, pick your place, reserve on WhatsApp.
import { MATCHES, INSTAGRAM_URL, MAX_TICKETS } from './data.js';
import { buildBlocks } from './geometry.js';
import {
  detailHTML, showTip, hideTip, openSheet, closeSheet, isSheetOpen, matchStatus, statusText, whenText, venueOf,
  esc, money, kMoney, compareHTML, reducedMotion, flagImg, priceColor, coarsePointer, tuneWaLink, deposit,
} from './ui.js';
import { WA_ICON } from './icons.js';
import { render as renderCheckout } from './checkout.js';
import { initCart, openCart, closeCart, isCartOpen, addToCart, onCartChange, cartCount, waLink } from './cart.js';
import { wordmark } from './logo.js';
import { mountMap } from './map.js';
import { CLIENTS, SOLD, CASES } from './clients.js';

const SIM_NOW = new Date('2026-10-01T12:00:00-03:00').getTime();
const $ = (s) => document.querySelector(s);
const views = { home: $('#view-home'), match: $('#view-match'), reserva: $('#view-reserva') };
const blocksCache = new Map();

const state = { simulated: false, homeReady: false, current: { view: 'home' } };
const now = () => (state.simulated ? SIM_NOW : Date.now());
const matchById = (id) => MATCHES.find((m) => m.id === id);
const isFinished = (m) => matchStatus(m, now()) === 'finished';
const blocksFor = (m) => {
  if (!blocksCache.has(m.id)) blocksCache.set(m.id, buildBlocks(m));
  return blocksCache.get(m.id);
};
const fromPrice = (m) => Math.min(...m.cats.map((c) => c.price));
const themeStyle = (m) => `--ra:${m.theme.a};--rb:${m.theme.b};--rc:${m.theme.c}`;

let pointer = 'mouse';
document.addEventListener('pointerdown', (e) => { pointer = e.pointerType; }, true);
document.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') pointer = 'mouse'; }, true);

// ---------- videos: poster first, video only when visible and allowed ----------
const saveData = () => Boolean(navigator.connection && navigator.connection.saveData);
// Decorative video only on connections that can afford it; the poster carries the design otherwise.
const goodConnection = () => {
  const c = navigator.connection;
  if (!c) return true;
  return !c.saveData && !['slow-2g', '2g', '3g'].includes(c.effectiveType) && (c.downlink ?? 10) >= 1.5;
};
const portrait = () => window.matchMedia('(max-aspect-ratio: 4/5)').matches;
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target: v, isIntersecting }) => {
    if (!isIntersecting) { v.pause(); return; }
    const userPlay = v.dataset.userPlay !== undefined;
    if (reducedMotion() || (!userPlay && !goodConnection()) || (userPlay && saveData())) return;
    if (!v.getAttribute('src')) v.src = portrait() && v.dataset.srcM ? v.dataset.srcM : v.dataset.src;
    v.play().catch(() => { if (userPlay) v.controls = true; });
  });
}, { threshold: 0.15 });
// Posters of content videos load a little before they scroll into view.
const posterObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting && v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
  });
}, { rootMargin: '600px 0px' });

function bgHTML(role) {
  return `<div class="bg" aria-hidden="true">
    <picture><source media="(max-aspect-ratio: 4/5)" srcset="media/${role}-m.jpg"><img class="bg__poster" src="media/${role}.jpg" alt="" fetchpriority="high"></picture>
    <video class="bg__video" muted playsinline loop preload="none" data-src="media/${role}.mp4" data-src-m="media/${role}-m.mp4"></video>
    <div class="bg__scrim"></div></div>`;
}

function wireVideos(root) {
  root.querySelectorAll('video[data-src]').forEach((v) => {
    v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
    v.addEventListener('error', () => v.remove(), { once: true });
    if (v.dataset.poster) posterObserver.observe(v);
    if (v.dataset.userPlay !== undefined && (reducedMotion() || saveData())) {
      // content video: no autoplay, the viewer can still press play
      v.src = v.dataset.src;
      v.controls = true;
      return;
    }
    videoObserver.observe(v);
  });
}

// ---------- home ----------
const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function dateParts(m) {
  const d = new Date(m.kickoff);
  const tz = 'America/Argentina/Buenos_Aires';
  const [y, mo, day] = d.toLocaleDateString('en-CA', { timeZone: tz }).split('-').map(Number);
  const wd = d.toLocaleDateString('es-AR', { timeZone: tz, weekday: 'long' });
  return { day, month: MONTHS[mo - 1], year: y, weekday: wd.charAt(0).toUpperCase() + wd.slice(1) };
}

function cardHTML(m) {
  const st = matchStatus(m, now());
  const done = st === 'finished';
  const dp = dateParts(m);
  const venue = venueOf(m);
  const cats = [...m.cats].sort((a, b) => a.price - b.price)
    .map((c) => `<span class="fx__cat">${esc(c.label)} <b>${money(c.price)}</b></span>`).join('');
  const cta = done ? (m.result ? 'Ver cómo salió' : 'Ver el partido') : 'Ver ubicaciones';
  return `<li><button class="fx is-${st}" type="button" data-match="${m.id}" data-bg="${m.id}" style="${themeStyle(m)}">
    <span class="fx__date"><span class="fx__wd">${esc(dp.weekday)}</span><span class="fx__day">${dp.day}</span><span class="fx__mo">${dp.month}</span><span class="fx__hr">${esc(whenText(m).split(' · ')[1])} h</span></span>
    <span class="fx__media">
      <img class="fx__img" src="media/${m.id}.jpg" srcset="media/${m.id}-480.jpg 480w, media/${m.id}.jpg 1280w" sizes="(max-width: 560px) 70vw, 300px" alt="" loading="lazy">
      <span class="fx__flags">${flagImg('arg')}${flagImg(m.flag)}</span>
      <span class="fx__ribbon" aria-hidden="true"></span>
    </span>
    <span class="fx__info">
      <span class="fx__kicker">Amistoso · ${esc(venue.name)}, ${esc(venue.city)}</span>
      <span class="fx__title">Argentina <em>vs</em> ${esc(m.rival)}</span>
      <span class="fx__cats">${cats}</span>
    </span>
    <span class="fx__buy">
      <span class="chip chip--${st}">${esc(statusText(m, now()))}</span>
      ${done ? '' : `<span class="fx__from">desde <b>${money(fromPrice(m))}</b></span>`}
      <span class="fx__cta">${cta}</span>
    </span>
  </button></li>`;
}

function renderCards() {
  $('#cards').innerHTML = MATCHES.map(cardHTML).join('');
}

// Keeps keyboard focus: only rebuild the cards when a status actually changed.
function refreshCards() {
  const cards = [...document.querySelectorAll('#cards .fx')];
  const changed = cards.some((c) => !c.classList.contains(`is-${matchStatus(matchById(c.dataset.match), now())}`));
  if (changed || !cards.length) { renderCards(); return; }
  cards.forEach((c) => { c.querySelector('.chip').textContent = statusText(matchById(c.dataset.match), now()); });
}

function renderClients() {
  const tile = (c) => `<figure class="client">
      <img src="img/${c.img}" srcset="img/${c.img.replace('.jpg', '-480.jpg')} 480w, img/${c.img} 750w" sizes="(max-width: 560px) 76vw, 33vw" alt="Cliente de Vexo con su entrada para ${esc(c.match)}" width="750" height="1000" loading="lazy">
      <figcaption><span class="client__meta">${esc(c.match)}${c.sector ? ` · ${esc(c.sector)}` : ''} · entregada el ${esc(c.date.slice(0, 5))}</span>${esc(c.text)}</figcaption>
    </figure>`;
  const video = `<figure class="client client--video">
      <video data-src="media/entrega-051.mp4" data-user-play data-poster="media/entrega-051.jpg" muted playsinline loop preload="none" aria-label="Video de una entrega en mano"></video>
      <figcaption><span class="client__meta">Argentina vs Zambia · Popular Sur Media · entregada el 31/03</span>Así entregamos: en mano, cara a cara.</figcaption>
    </figure>`;
  $('#clients-grid').innerHTML = [tile(CLIENTS[0]), video, ...CLIENTS.slice(1).map(tile)].join('');
  $('#sold').innerHTML = SOLD.map((s) => `<li><span class="sold__when">${esc(s.when)}</span><b>${esc(s.what)}</b>${s.where ? `<span>${esc(s.where)}</span>` : ''}</li>`).join('');
}

// ---------- success cases: drifts slowly left to right, loops, yields to the viewer's hand ----------
function caseHTML(c, hidden) {
  return `<figure class="case"${hidden ? ' aria-hidden="true"' : ''}>
    <img src="img/${c.img}" alt="${hidden ? '' : `Cliente de Vexo con su entrada para ${esc(c.match)}`}" width="600" height="800" loading="lazy">
    <figcaption><span class="case__tag">${esc(c.match)} · ${esc(c.sector)}</span><p>${esc(c.text)}</p><span class="case__date">Entregada el ${esc(c.date)}</span></figcaption>
  </figure>`;
}

function initCases() {
  const vp = $('#cases');
  // two copies so the drift can wrap without a visible jump; the copy is hidden from screen readers
  vp.innerHTML = CASES.map((c) => caseHTML(c, false)).join('') + CASES.map((c) => caseHTML(c, true)).join('');
  const half = () => vp.scrollWidth / 2;
  let pos = 0;
  let pausedUntil = 0;
  let hovering = false;
  let visible = false;
  let last = 0;
  const wrap = () => {
    if (vp.scrollLeft <= 1) vp.scrollLeft += half();
    else if (vp.scrollLeft >= half() * 2 - vp.clientWidth - 1) vp.scrollLeft -= half();
    pos = vp.scrollLeft;
  };
  requestAnimationFrame(() => { vp.scrollLeft = half(); pos = vp.scrollLeft; });
  const hold = (ms) => { pausedUntil = performance.now() + ms; };
  vp.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
  vp.addEventListener('pointerleave', () => { hovering = false; hold(600); });
  vp.addEventListener('pointerdown', () => hold(3000));
  vp.addEventListener('touchstart', () => hold(3000), { passive: true });
  vp.addEventListener('focusin', () => hold(6000));
  vp.addEventListener('scroll', () => { if (performance.now() < pausedUntil || hovering) wrap(); }, { passive: true });
  document.querySelector('.cases__nav').addEventListener('click', (e) => {
    const dir = Number(e.target.closest('[data-cases]')?.dataset.cases || 0);
    if (!dir) return;
    hold(4000);
    const card = vp.querySelector('.case');
    vp.scrollBy({ left: dir * (card.offsetWidth + 14), behavior: reducedMotion() ? 'auto' : 'smooth' });
  });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(vp);
  if (reducedMotion()) return;
  const SPEED = 26; // px per second, content moving to the right
  const step = (t) => {
    const dt = last ? Math.min(64, t - last) : 0;
    last = t;
    if (visible && !hovering && t > pausedUntil && state.current.view === 'home') {
      pos -= (SPEED * dt) / 1000;
      if (pos <= 1) pos += half();
      vp.scrollLeft = Math.round(pos);
    } else {
      pos = vp.scrollLeft;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// The landing is only built when it is first shown, so a direct link to a match stays light.
function ensureHome() {
  if (state.homeReady) { refreshCards(); return; }
  $('#intro-bg').innerHTML = bgHTML('hero');
  views.home.querySelectorAll('img[data-src]').forEach((img) => { img.src = img.dataset.src; });
  renderCards();
  initCases();
  renderClients();
  wireVideos(views.home);
  state.homeReady = true;
}

// ---------- match page ----------
let map = null;

function categoryBlock(m, catId) {
  const cat = m.cats.find((c) => c.id === catId);
  return cat ? { id: `cat-${cat.id}`, name: cat.label, position: cat.where, cat, isCategory: true } : null;
}

function findBlock(m, blockId) {
  if (!blockId) return null;
  if (blockId.startsWith('cat-')) return categoryBlock(m, blockId.slice(4));
  return blocksFor(m).find((b) => b.id === blockId && b.cat) || null;
}

function catRowHTML(c) {
  return `<li class="cat" data-cat="${c.id}">
    <div class="cat__top"><b class="cat__name">${esc(c.label)}</b><span class="cat__price">${money(c.price)}</span></div>
    <p class="cat__where">${esc(c.where)}</p>
    <p class="cat__feel">${esc(c.feel)}</p>
    ${compareHTML(c)}
    <button class="btn btn--line" type="button" data-pick-cat="${c.id}">Elegir ${esc(c.label)}</button>
  </li>`;
}

function matchHeroHTML(m) {
  const st = matchStatus(m, now());
  const venue = venueOf(m);
  const done = st === 'finished';
  const next = MATCHES.find((x) => !isFinished(x) && x.id !== m.id);
  const sub = done
    ? (m.result ? `Terminó ${m.result.arg} a ${m.result.rival}. Gracias a los que fueron con nosotros.` : 'Gracias a los que fueron con nosotros. Pronto cargamos el resultado.')
    : m.subline;
  return `<section class="mhero" data-look="${m.id}" style="${themeStyle(m)}">
    ${bgHTML(m.id)}
    <div class="wrap mhero__in">
      <button class="mhero__back" type="button" data-go="home">← Todos los partidos</button>
      <div class="mhero__flags">${flagImg('arg', 'flag flag--xl')}<span class="mhero__x">vs</span>${flagImg(m.flag, 'flag flag--xl')}</div>
      <p class="mhero__eyebrow">Amistoso · ${esc(whenText(m, { long: true }))} · ${esc(venue.name)}, ${esc(venue.city)}</p>
      <h1 class="mhero__title">${esc(done ? 'Este partido ya se jugó' : m.headline)}</h1>
      <p class="mhero__sub">${esc(sub)}</p>
      <div class="mhero__row">
        <span class="chip chip--${st}">${esc(statusText(m, now()))}</span>
        <span class="mhero__nick">Enfrente: ${esc(m.nickname)}</span>
        ${done && next ? `<button class="btn btn--sol" type="button" data-match="${next.id}">Ir a Argentina vs ${esc(next.rival)}</button>` : ''}
        ${done ? '' : '<a class="btn btn--sol" href="#elegir" data-scroll="elegir">Elegir mi lugar</a>'}
      </div>
    </div>
    <div class="mhero__ribbon" aria-hidden="true"></div>
  </section>`;
}

function teardownMatch() {
  map?.destroy();
  map = null;
}

function renderMatch(m) {
  teardownMatch();
  const done = isFinished(m);
  views.match.innerHTML = `${matchHeroHTML(m)}
    ${done ? '' : `<section class="wrap pick" id="elegir" style="${themeStyle(m)}">
      <div class="pick__head">
        <h2 class="pick__title">Elegí tu lugar</h2>
        <p class="pick__lead">${coarsePointer() ? 'Tocá una tribuna y te mostramos cómo figura en la entrada y su precio final.' : 'Pasá el mouse por cada tribuna para ver su nombre, como figura en la entrada, y su precio final. Nada de sorpresas al pagar.'}</p>
      </div>
      <nav class="catbar" aria-label="Categorías">${[...m.cats].sort((a, b) => a.price - b.price).map((c) => `<button type="button" class="catbar__pill" data-cat-pill="${c.id}"><i style="background:${priceColor(m, c)}"></i>${esc(c.label)} <b>${kMoney(c.price)}</b></button>`).join('')}</nav>
      <div class="pick__grid">
        <div class="stage" id="stage"></div>
        <ul class="cats" id="cats">${m.cats.map(catRowHTML).join('')}</ul>
      </div>
      <ul class="promise">
        <li><b>Reservás con el 50%</b> cuando te confirmamos el lugar.</li>
        <li><b>El otro 50%, en mano</b>, cuando te damos la entrada original.</li>
        <li><b>Te atiende una persona</b> por WhatsApp, de principio a fin.</li>
      </ul>
    </section>`}`;
  wireVideos(views.match);
}

function mountMatchMap(m) {
  if (isFinished(m) || !$('#stage')) return;
  const blocks = blocksFor(m);
  map = mountMap($('#stage'), { match: m, blocks, onHover, onPick: (b) => onPick(m, b) });
  const cats = $('#cats');
  cats.addEventListener('pointerover', (e) => map?.highlightCat(e.target.closest('.cat')?.dataset.cat || null));
  cats.addEventListener('pointerleave', () => map?.highlightCat(null));
  cats.addEventListener('click', (e) => {
    const id = e.target.closest('[data-pick-cat]')?.dataset.pickCat;
    if (!id) return;
    if (pointer !== 'mouse') openBuySheet(m, categoryBlock(m, id));
    else goReserva(m, `cat-${id}`);
  });
  $('.catbar').addEventListener('click', (e) => {
    const id = e.target.closest('[data-cat-pill]')?.dataset.catPill;
    if (!id) return;
    map?.highlightCat(id);
    if (pointer !== 'mouse') openBuySheet(m, categoryBlock(m, id));
    else document.querySelector(`.cat[data-cat="${id}"]`)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  });
}

function onHover(block, x, y) {
  if (pointer !== 'mouse' || !block) { hideTip(); return; }
  showTip(detailHTML(matchById(state.current.matchId), block), x, y);
}

function cartItem(m, block, qty) {
  return {
    key: `${m.id}:${block.id}`,
    matchId: m.id,
    blockId: block.id,
    name: block.name,
    position: block.position,
    isCategory: Boolean(block.isCategory),
    price: block.cat.price,
    qty,
  };
}

// Phones: the sheet is a small checkout, so a place goes to the cart without leaving the map.
function openBuySheet(m, block) {
  if (block.isCategory) map?.setSelectedCat(block.cat.id);
  else if (block.cat) map?.setSelected(block.id);
  if (!block.cat) {
    openSheet({ body: detailHTML(m, block) });
    return;
  }
  let qty = 2;
  const totalHTML = () => `<span>${qty} ${qty > 1 ? 'entradas' : 'entrada'} · total final</span><b>${money(block.cat.price * qty)}</b><span>Reservás con ${money(deposit(block.cat.price * qty))} (50%)</span>`;
  const body = block.isCategory
    ? `<p class="tip__label">${esc(block.name)}</p><p class="tip__pos">${esc(block.position)}</p>
       <p class="tip__price">${money(block.cat.price)}</p><p class="tip__unit">precio final por entrada · la tribuna la confirmamos juntos</p>
       <p class="tip__feel">${esc(block.cat.feel)}</p>${compareHTML(block.cat)}`
    : detailHTML(m, block);
  openSheet({
    label: `Comprar ${block.name}`,
    body: `${body}<div class="sheet__buy">
        <div class="stepper stepper--sm"><button type="button" data-act="minus" aria-label="Una entrada menos">−</button><output>${qty}</output><button type="button" data-act="plus" aria-label="Una entrada más">+</button></div>
        <p class="sheet__total" aria-live="polite">${totalHTML()}</p>
      </div>`,
    actions: `<button class="btn btn--sol" type="button" data-act="add">Agregar al carrito</button>
      <button class="btn btn--line" type="button" data-act="detail">Ver entrada</button>`,
    onAction(act, btn, card) {
      if (act === 'minus' || act === 'plus') {
        qty = Math.min(MAX_TICKETS, Math.max(1, qty + (act === 'plus' ? 1 : -1)));
        card.querySelector('.sheet__buy output').textContent = qty;
        card.querySelector('.sheet__total').innerHTML = totalHTML();
      }
      if (act === 'add') {
        addToCart(cartItem(m, block, qty));
        closeSheet({ then: openCart });
      }
      if (act === 'detail') closeSheet({ then: () => goReserva(m, block.id, qty) });
    },
  });
}

function onPick(m, block) {
  if (pointer !== 'mouse') { openBuySheet(m, block); return; }
  if (block.cat) goReserva(m, block.id);
}

// ---------- routing: every history entry fully describes its screen ----------
let cleanupReserva = null;

function hashFor(e) {
  if (e.view === 'match') return `#${e.matchId}`;
  if (e.view === 'reserva') return '#reserva';
  return e.anchor === 'clientes' || e.anchor === 'partidos' ? `#${e.anchor}` : '#inicio';
}

function setHistory(entry, replace) {
  try { history[replace ? 'replaceState' : 'pushState'](entry, '', hashFor(entry)); } catch { /* sandboxed frame */ }
}

function scrollToAnchor(anchor) {
  const el = anchor && document.getElementById(anchor);
  if (el) el.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, 0);
}

function apply(view, after) {
  let ran = false;
  const run = () => {
    if (ran) return;
    ran = true;
    Object.entries(views).forEach(([k, el]) => { el.hidden = k !== view; });
    after();
    onScroll();
  };
  if (!document.startViewTransition || reducedMotion()) { run(); return; }
  const t = document.startViewTransition(run);
  t.ready.catch(() => {});
  t.finished.catch(() => {});
  // Chrome can leave a transition started inside popstate without calling back: the screen must change anyway.
  setTimeout(() => {
    if (ran) return;
    t.skipTransition();
    run();
  }, 150);
}

function render(entry) {
  closeSheet({ fromPop: true });
  closeCart({ fromPop: true });
  hideTip();
  const m = entry.matchId ? matchById(entry.matchId) : null;
  if (entry.view !== 'home' && !m) return go({ view: 'home' }, { replace: true });
  if (entry.view === 'reserva') {
    const block = findBlock(m, entry.blockId);
    if (!block || isFinished(m)) return go({ view: 'match', matchId: m.id }, { replace: true });
  }
  cleanupReserva?.();
  cleanupReserva = null;
  state.current = entry;
  if (entry.view === 'home') {
    teardownMatch();
    ensureHome();
    apply('home', () => scrollToAnchor(entry.anchor));
  } else if (entry.view === 'match') {
    renderMatch(m);
    apply('match', () => { mountMatchMap(m); scrollToAnchor(entry.anchor); });
  } else {
    teardownMatch();
    cleanupReserva = renderCheckout(views.reserva, { match: m, block: findBlock(m, entry.blockId), blocks: blocksFor(m), qty: entry.qty || 2 }, {
      onBack: back,
      onQty: (qty) => { state.current = { ...state.current, qty }; setHistory(state.current, true); },
    });
    apply('reserva', () => window.scrollTo(0, 0));
  }
  return undefined;
}

function go(entry, { replace = false } = {}) {
  render(entry);
  setHistory(state.current, replace);
}

function goReserva(m, blockId, qty = 2) {
  // coming back from the reservation returns to the map, not to the top of the hero
  setHistory({ ...state.current, anchor: 'elegir' }, true);
  go({ view: 'reserva', matchId: m.id, blockId, qty });
}

function back() {
  const before = location.href;
  history.back();
  // sandboxed frames may ignore history: fall back to the match page
  setTimeout(() => {
    if (location.href === before && state.current.view === 'reserva') go({ view: 'match', matchId: state.current.matchId, anchor: 'elegir' });
  }, 350);
}

function entryFromLocation() {
  const s = history.state;
  if (s && s.view) return s;
  const h = location.hash.slice(1);
  if (matchById(h)) return { view: 'match', matchId: h };
  if (h === 'clientes' || h === 'partidos') return { view: 'home', anchor: h };
  return { view: 'home' };
}

const sameScreen = (a, b) => a.view === b.view && a.matchId === b.matchId && a.blockId === b.blockId;

window.addEventListener('popstate', () => {
  const entry = entryFromLocation();
  // only the overlay that owned the popped entry closes (its follow-up may open the next one)
  if (isSheetOpen() && sameScreen(entry, state.current)) { closeSheet({ fromPop: true }); return; }
  if (isCartOpen() && sameScreen(entry, state.current)) { closeCart({ fromPop: true }); return; }
  if (history.state?.overlay && sameScreen(entry, state.current)) return;
  render(entry);
});
// Header is transparent over the intro and turns solid after it; the intro eases out as you scroll.
const top = $('#top');
let ticking = false;
function onScroll() {
  ticking = false;
  const intro = $('#intro');
  const onIntro = state.current.view === 'home' && intro;
  const h = onIntro ? intro.offsetHeight : 1;
  const p = onIntro ? Math.min(1, Math.max(0, window.scrollY / (h * 0.7))) : 1;
  top.classList.toggle('is-over', onIntro && p < 0.98);
  if (onIntro && !reducedMotion()) $('#intro-center').style.setProperty('--p', p.toFixed(3));
}
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

window.addEventListener('scroll', () => {
  if (document.getElementById('tip').hidden) return;
  hideTip();
  map?.highlightCat(null);
}, { passive: true });

document.addEventListener('click', (e) => {
  const card = e.target.closest('[data-match]');
  if (card) { e.preventDefault(); go({ view: 'match', matchId: card.dataset.match }); return; }
  const toFixtures = e.target.closest('[data-go="partidos"]');
  if (toFixtures) {
    e.preventDefault();
    closeCart({
      then: () => {
        if (state.current.view === 'home') document.getElementById('partidos').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
        else go({ view: 'home', anchor: 'partidos' });
      },
    });
    return;
  }
  const home = e.target.closest('[data-go="home"]');
  if (home) {
    e.preventDefault();
    if (state.current.view === 'home') window.scrollTo(0, 0);
    else go({ view: 'home' });
    return;
  }
  const scroll = e.target.closest('[data-scroll]');
  if (!scroll) return;
  e.preventDefault();
  const id = scroll.dataset.scroll;
  if ((id === 'clientes' || id === 'partidos') && state.current.view !== 'home') { go({ view: 'home', anchor: id }); return; }
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
});

$('#sim').addEventListener('click', (e) => {
  state.simulated = !state.simulated;
  e.currentTarget.setAttribute('aria-pressed', String(state.simulated));
  e.currentTarget.textContent = state.simulated ? 'Volver a hoy' : 'Simular 1/10 (Bolivia ya se jugó)';
  if (state.homeReady) refreshCards();
  if (state.current.view !== 'home') render(state.current);
});

function paintCartCount() {
  const n = cartCount();
  $('#cart-n').textContent = n;
  $('#cart-btn').classList.toggle('has-items', n > 0);
  $('#cart-btn').setAttribute('aria-label', n ? `Abrir el carrito, ${n} ${n > 1 ? 'entradas' : 'entrada'}` : 'Abrir el carrito, vacío');
}

function addMeta(name, content) {
  if (document.head.querySelector(`meta[name="${name}"]`)) return;
  const meta = document.createElement('meta');
  meta.name = name;
  meta.content = content;
  document.head.append(meta);
}

function init() {
  addMeta('theme-color', '#070a12');
  addMeta('color-scheme', 'dark');
  document.addEventListener('touchstart', () => {}, { passive: true }); // lets iOS apply :active
  $('#brand').innerHTML = wordmark({ cls: 'wordmark wordmark--sm' });
  $('#intro-logo').innerHTML = wordmark({ cls: 'wordmark wordmark--xl', label: 'Vexo' });
  $('#foot-logo').innerHTML = wordmark({ cls: 'wordmark wordmark--sm' });
  initCart();
  onCartChange(() => {
    paintCartCount();
    $('#cart-btn').classList.remove('is-bump');
    void $('#cart-btn').offsetWidth;
    $('#cart-btn').classList.add('is-bump');
  });
  paintCartCount();
  $('#cart-btn').addEventListener('click', openCart);
  const hello = waLink('¡Hola! Quiero consultar por entradas para la Selección.');
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = hello;
    tuneWaLink(a);
    if (!a.querySelector('svg')) a.insertAdjacentHTML('afterbegin', WA_ICON);
  });
  const ig = $('#ig');
  if (INSTAGRAM_URL) ig.href = INSTAGRAM_URL;
  else { ig.removeAttribute('target'); ig.setAttribute('aria-disabled', 'true'); ig.addEventListener('click', (e) => e.preventDefault()); }
  go(entryFromLocation(), { replace: true });
  setInterval(() => { if (state.homeReady && state.current.view === 'home') refreshCards(); }, 60000);
}

init();
