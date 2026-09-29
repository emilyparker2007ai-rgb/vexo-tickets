// Ticket page: every detail of the chosen place, then add to cart or reserve right away on WhatsApp.
import { MAX_TICKETS } from './data.js';
import { money, esc, whenText, venueOf, flagImg, tuneWaLink } from './ui.js';
import { WA_ICON } from './icons.js';
import { mountMap } from './map.js';
import { addToCart, openCart, waLink, copyText, inAppHint } from './cart.js';

function reservationCode(match, block) {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `VX-${match.id.toUpperCase()}-${block.id}-${n}`;
}

function placeLine(block) {
  if (block.isCategory) return `Ubicación: ${block.name} (${block.position}). La tribuna exacta la vemos juntos.`;
  return `Ubicación: ${block.name}, ${block.position} (${block.cat.label})`;
}

function message(sel, qty, code) {
  const { match, block } = sel;
  const plural = qty > 1 ? `${qty} entradas` : '1 entrada';
  return [
    `¡Hola! Quiero reservar ${plural} para Argentina vs ${match.rival}.`,
    '',
    `${whenText(match, { long: true })} · ${venueOf(match).name}`,
    placeLine(block),
    `Precio final: ${money(block.cat.price)} cada una · Total ${money(block.cat.price * qty)}`,
    '',
    `Mi código de reserva es ${code}. ¿Me confirman si está disponible?`,
  ].join('\n');
}

export function render(root, sel, { onBack, onQty }) {
  const { match, block } = sel;
  const venue = venueOf(match);
  let qty = Math.min(MAX_TICKETS, sel.qty || 2);
  const code = reservationCode(match, block);

  root.innerHTML = `
    <div class="wrap co" style="--ra:${match.theme.a};--rb:${match.theme.b};--rc:${match.theme.c}">
      <button class="co__back" type="button" data-act="back">← Volver al estadio</button>
      <div class="co__grid">
        <article class="ticket" aria-label="Detalle de tu entrada">
          <div class="ticket__main">
            <div class="ticket__flags">${flagImg('arg')}<span>vs</span>${flagImg(match.flag)}</div>
            <h1 class="ticket__title"><span>Argentina</span><span class="ticket__vs">vs</span><span>${esc(match.rival)}</span></h1>
            <dl class="ticket__facts">
              <div><dt>Cuándo</dt><dd>${esc(whenText(match, { long: true }))}</dd></div>
              <div><dt>Dónde</dt><dd>${esc(venue.name)}</dd></div>
              <div><dt>Sector</dt><dd>${esc(block.name)}</dd></div>
              <div><dt>Ubicación</dt><dd>${block.isCategory ? `${esc(block.position)}. Te confirmamos la tribuna.` : `${esc(block.position)} · ${esc(block.cat.label)}`}</dd></div>
            </dl>
          </div>
          <div class="ticket__stub">
            <div class="ticket__map"></div>
            <p class="ticket__qty"><b id="tk-qty">${qty}</b><span id="tk-qty-l">${qty > 1 ? 'entradas' : 'entrada'}</span></p>
            <p class="mono ticket__code">${esc(code)}</p>
          </div>
        </article>

        <aside class="co__sum" aria-label="Resumen">
          <p class="co__hello">Ya casi estás en la cancha</p>
          <div class="co__line"><span>Precio final por entrada</span><b>${money(block.cat.price)}</b></div>
          <div class="co__line">
            <span>Cantidad</span>
            <div class="stepper stepper--sm"><button type="button" data-d="-1" aria-label="Una entrada menos">−</button><output id="co-qty">${qty}</output><button type="button" data-d="1" aria-label="Una entrada más">+</button></div>
          </div>
          <div class="co__total"><span>Total final</span><b id="co-total">${money(block.cat.price * qty)}</b></div>
          <button class="btn btn--sol btn--xl" type="button" data-act="add" id="co-add">Agregar al carrito</button>
          <a class="btn btn--wa btn--xl" id="co-wa" href="#" target="_blank" rel="noopener">${WA_ICON}<span>Reservar por WhatsApp</span></a>
          ${inAppHint()}
          <ol class="co__steps">
            <li><span><b>Nos escribís por WhatsApp</b> con tu pedido. Te responde una persona, no un robot.</span></li>
            <li><span><b>Te confirmamos el lugar exacto</b> y recién ahí pagás.</span></li>
            <li><span><b>Te damos la entrada original</b> en mano, o te la transferimos si es digital.</span></li>
          </ol>
          <details class="co__msg">
            <summary>Ver el mensaje que nos llega</summary>
            <pre id="co-text"></pre>
            <button class="btn btn--ghost" type="button" data-act="copy">Copiar mensaje</button>
          </details>
        </aside>
      </div>
      <div class="co-bar" id="co-bar" aria-hidden="true">
        <div class="co-bar__sum"><b id="bar-total"></b><span id="bar-meta"></span></div>
        <button class="btn btn--sol" type="button" data-act="add" tabindex="-1">Agregar al carrito</button>
      </div>
    </div>`;
  tuneWaLink(root.querySelector('#co-wa'));
  // phones: the price and the main action stay under the thumb until the real button scrolls in
  const bar = root.querySelector('#co-bar');
  const add = root.querySelector('#co-add');
  let barTick = 0;
  const paintBar = () => {
    barTick = 0;
    const r = add.getBoundingClientRect();
    const show = r.height > 0 && r.top > window.innerHeight - 40;
    bar.classList.toggle('is-on', show);
    bar.setAttribute('aria-hidden', String(!show));
  };
  const onBarScroll = () => { if (!barTick) barTick = requestAnimationFrame(paintBar); };
  window.addEventListener('scroll', onBarScroll, { passive: true });
  window.addEventListener('resize', onBarScroll);
  requestAnimationFrame(() => requestAnimationFrame(paintBar));
  const barObserver = { disconnect() { window.removeEventListener('scroll', onBarScroll); window.removeEventListener('resize', onBarScroll); } };

  const mini = mountMap(root.querySelector('.ticket__map'), { match, blocks: sel.blocks }, { mini: true, interactive: false });
  if (block.isCategory) mini.setSelectedCat(block.cat.id);
  else mini.setSelected(block.id);

  const update = () => {
    const text = message(sel, qty, code);
    root.querySelector('#co-text').textContent = text;
    root.querySelector('#co-wa').href = waLink(text);
    root.querySelector('#co-total').textContent = money(block.cat.price * qty);
    root.querySelector('#co-qty').textContent = qty;
    root.querySelector('#tk-qty').textContent = qty;
    root.querySelector('#tk-qty-l').textContent = qty > 1 ? 'entradas' : 'entrada';
    root.querySelector('[data-act="copy"]').textContent = 'Copiar mensaje';
    root.querySelector('#bar-total').textContent = money(block.cat.price * qty);
    root.querySelector('#bar-meta').textContent = `${qty} ${qty > 1 ? 'entradas' : 'entrada'} · precio final`;
  };
  update();

  root.onclick = async (e) => {
    const d = e.target.closest('[data-d]');
    if (d) {
      qty = Math.min(MAX_TICKETS, Math.max(1, qty + Number(d.dataset.d)));
      update();
      onQty?.(qty);
      return;
    }
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'back') onBack();
    if (act === 'add') {
      addToCart({
        key: `${match.id}:${block.id}`,
        matchId: match.id,
        blockId: block.id,
        name: block.name,
        position: block.position,
        isCategory: Boolean(block.isCategory),
        price: block.cat.price,
        qty,
      });
      openCart();
    }
    if (act === 'copy') copyText(message(sel, qty, code), e.target.closest('[data-act]'), root.querySelector('#co-text'));
  };

  return () => {
    barObserver.disconnect();
    mini.destroy();
  };
}
