// Shopping cart: items live in this browser (localStorage); checkout is one WhatsApp message.
// On phones it is a bottom sheet that owns a history entry, so Back closes it.
import { MATCHES, MAX_TICKETS, WHATSAPP_NUMBER } from './data.js';
import { money, esc, whenText, venueOf, flagImg, pushOverlay, swipeToClose, tuneWaLink, inAppBrowser } from './ui.js';
import { WA_ICON } from './icons.js';

const KEY = 'vexo-cart-v1';
let items = load();
let lastFocus = null;
let open = false;
let then = null;
let removed = null;
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((i) => MATCHES.some((m) => m.id === i.matchId)) : [];
  } catch {
    return [];
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked: cart lives for this visit */ }
  listeners.forEach((fn) => fn(items));
}

export const onCartChange = (fn) => listeners.add(fn);
export const cartCount = () => items.reduce((n, i) => n + i.qty, 0);
export const isCartOpen = () => open;
const total = () => items.reduce((n, i) => n + i.price * i.qty, 0);

export function addToCart(item) {
  const found = items.find((i) => i.key === item.key);
  items = found
    ? items.map((i) => (i.key === item.key ? { ...i, qty: Math.min(MAX_TICKETS, i.qty + item.qty) } : i))
    : [...items, item];
  navigator.vibrate?.(12);
  save();
}

function setQty(key, qty) {
  items = qty <= 0 ? items.filter((i) => i.key !== key) : items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_TICKETS, qty) } : i));
  save();
}

export function waLink(text) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

export async function copyText(text, button, pre) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copiado';
  } catch {
    if (pre) {
      const range = document.createRange();
      range.selectNodeContents(pre);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range);
    }
    button.textContent = 'Seleccionado: copialo';
  }
}

export function inAppHint() {
  return inAppBrowser()
    ? '<p class="inapp">Si WhatsApp no se abre, tocá los tres puntos de arriba y elegí “Abrir en el navegador”. También podés copiar el pedido y pegarlo en el chat.</p>'
    : '';
}

function orderCode() {
  return `VX-${Math.floor(1000 + Math.random() * 9000)}`;
}

function cartMessage(code) {
  const lines = items.map((i, n) => {
    const m = MATCHES.find((x) => x.id === i.matchId);
    const where = i.isCategory ? `${i.name} (la tribuna la vemos juntos)` : `${i.name}, ${i.position}`;
    return `${n + 1}) Argentina vs ${m.rival}, ${whenText(m)} en el ${venueOf(m).short}: ${where}. ${i.qty} × ${money(i.price)} = ${money(i.price * i.qty)}`;
  });
  return ['¡Hola! Quiero reservar estas entradas:', '', ...lines, '', `Total: ${money(total())}`, `Pedido ${code}. ¿Me confirman disponibilidad?`].join('\n');
}

function itemHTML(i) {
  const m = MATCHES.find((x) => x.id === i.matchId);
  return `<li class="cart__item" data-key="${esc(i.key)}">
    <div class="cart__flags">${flagImg('arg')}${flagImg(m.flag)}</div>
    <div class="cart__info">
      <p class="cart__match">Argentina vs ${esc(m.rival)}</p>
      <p class="cart__meta">${esc(whenText(m))} · ${esc(venueOf(m).short)}</p>
      <p class="cart__place">${esc(i.name)}${i.isCategory ? '' : ` · ${esc(i.position)}`}</p>
      <div class="cart__row">
        <div class="stepper stepper--sm"><button type="button" data-q="-1" aria-label="Una entrada menos">−</button><output>${i.qty}</output><button type="button" data-q="1" aria-label="Una entrada más">+</button></div>
        <b class="cart__sub">${money(i.price * i.qty)}</b>
      </div>
      <button class="cart__remove" type="button" data-remove>Quitar</button>
    </div>
  </li>`;
}

function undoHTML() {
  return removed ? `<div class="cart__undo" role="status"><span>Quitaste ${esc(removed.item.name)}</span><button type="button" data-undo>Deshacer</button></div>` : '';
}

function render() {
  const el = document.getElementById('cart');
  const body = el.querySelector('.cart__body');
  if (!items.length) {
    body.innerHTML = `${undoHTML()}<div class="cart__empty"><p class="cart__empty-title">Tu carrito está vacío</p>
      <p>Elegí un partido y una ubicación, y la sumás acá.</p>
      <button class="btn btn--sol" type="button" data-go="partidos">Ver partidos</button></div>`;
    return;
  }
  const code = orderCode();
  const text = cartMessage(code);
  body.innerHTML = `${undoHTML()}<ul class="cart__list">${items.map(itemHTML).join('')}</ul>
    <div class="cart__foot">
      <div class="cart__total"><span>Total final</span><b>${money(total())}</b></div>
      <p class="cart__note">Te confirmamos cada ubicación por WhatsApp y recién ahí pagás.</p>
      <a class="btn btn--sol btn--xl" data-wa-cta href="${waLink(text)}" target="_blank" rel="noopener">${WA_ICON}<span>Finalizar por WhatsApp</span></a>
      ${inAppHint()}
      <div class="cart__more">
        <button class="btn btn--ghost" type="button" data-cart-close>Seguir eligiendo</button>
        <button class="btn btn--ghost" type="button" data-copy>Copiar pedido</button>
      </div>
      <pre class="cart__text" hidden>${esc(text)}</pre>
    </div>`;
  body.querySelectorAll('[data-wa-cta]').forEach(tuneWaLink);
}

function hide() {
  const el = document.getElementById('cart');
  open = false;
  el.classList.remove('is-open');
  document.documentElement.classList.remove('is-locked');
  setTimeout(() => { if (!open) el.hidden = true; }, 300);
  lastFocus?.focus?.({ preventScroll: true });
  lastFocus = null;
}

export function openCart() {
  const el = document.getElementById('cart');
  if (open) { render(); return; }
  lastFocus = document.activeElement;
  removed = null;
  render();
  open = true;
  el.hidden = false;
  document.documentElement.classList.add('is-locked');
  pushOverlay('cart');
  requestAnimationFrame(() => {
    el.classList.add('is-open');
    el.querySelector('.cart__close').focus({ preventScroll: true });
  });
}

// then: runs after the cart is gone (and after its history entry is popped).
export function closeCart({ fromPop = false, then: next = null } = {}) {
  if (!open) { next?.(); return; }
  if (next) then = next;
  if (!fromPop && history.state?.overlay === 'cart') { history.back(); return; }
  hide();
  const cb = then;
  then = null;
  cb?.();
}

export function initCart() {
  const el = document.getElementById('cart');
  swipeToClose(el.querySelector('.cart__panel'), () => closeCart());
  el.addEventListener('click', (e) => {
    if (e.target === el || e.target.closest('[data-cart-close]')) { closeCart(); return; }
    if (e.target.closest('[data-copy]')) { copyText(el.querySelector('.cart__text').textContent, e.target.closest('[data-copy]')); return; }
    if (e.target.closest('[data-undo]') && removed) {
      items = [...items.slice(0, removed.index), removed.item, ...items.slice(removed.index)];
      removed = null;
      save();
      render();
      return;
    }
    const row = e.target.closest('.cart__item');
    if (!row) return;
    const item = items.find((i) => i.key === row.dataset.key);
    const q = e.target.closest('[data-q]');
    if (q) {
      const next = item.qty + Number(q.dataset.q);
      removed = next <= 0 ? { item, index: items.indexOf(item) } : null;
      setQty(item.key, next);
      render();
    }
    if (e.target.closest('[data-remove]')) {
      removed = { item, index: items.indexOf(item) };
      setQty(item.key, 0);
      render();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) closeCart(); });
}
