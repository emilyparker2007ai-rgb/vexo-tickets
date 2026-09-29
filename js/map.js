// Stadium map: top-down SVG with the final price written on each stand.
// Used big on the match page and small on the reservation ticket.
import { extents, pitchLines, PITCH } from './geometry.js';
import { venueOf, priceColor, priceT, kMoney, money, esc } from './ui.js';

const NS = 'http://www.w3.org/2000/svg';
const f1 = (n) => n.toFixed(1);
const pathD = (poly) => `M${poly.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}Z`;

function pitchSVG() {
  const { hw, hh } = PITCH;
  const stripes = Array.from({ length: 10 }, (_, i) =>
    `<rect x="${f1(-hw + i * 10.5)}" y="${-hh}" width="10.5" height="${hh * 2}" fill="${i % 2 ? '#0e2a24' : '#0c241f'}"/>`,
  ).join('');
  const lines = pitchLines()
    .map((l) => `<polyline points="${l.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}"/>`)
    .join('');
  return `<g class="pitch">${stripes}<g class="pitch__lines">${lines}</g></g>`;
}

function priceLabels(match, blocks, turn) {
  return blocks
    .filter((b) => b.cat && b.k === Math.floor(b.side.blocks / 2))
    .map((b) => {
      const ink = priceT(match, b.cat) < 0.4 ? '#eef2f7' : '#070a12';
      const [x, y] = b.center.map(f1);
      const upright = b.side.kind === 'end' ? ` transform="rotate(-90 ${x} ${y})"` : '';
      return `<text class="plano__price" x="${x}" y="${y}" fill="${ink}"${upright}>${kMoney(b.cat.price)}</text>`;
    })
    .join('');
}

function standLabels(match, turn) {
  const venue = venueOf(match);
  const [ax, by] = extents(venue);
  const spots = { E: [ax + 5, 0], W: [-ax - 5, 0], N: [0, -by - 4], S: [0, by + 6.5] };
  // Text angle inside the (possibly turned) group so every stand name reads along its stand.
  const angle = turn ? { E: -90, W: -90, N: 0, S: 180 } : { E: 90, W: -90, N: 0, S: 0 };
  return venue.sides
    .map((s) => {
      const [x, y] = spots[s.id];
      const rot = angle[s.id];
      return `<text class="plano__stand" x="${f1(x)}" y="${f1(y)}" transform="rotate(${rot} ${f1(x)} ${f1(y)})">${esc(s.name.toUpperCase())}</text>`;
    })
    .join('');
}

export function mountMap(el, ctx, opts = {}) {
  const { match, blocks } = ctx;
  const { mini = false, interactive = true } = opts;
  const labels = !mini;
  const [ax, by] = extents(venueOf(match));
  const pad = labels ? 12 : 3;
  // On tall containers (phones) the stadium turns 90 degrees to use the height.
  const turn = !mini && el.clientHeight > el.clientWidth * 1.15;
  const [vw, vh] = turn ? [by, ax] : [ax, by];
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `${-vw - pad} ${-vh - pad} ${(vw + pad) * 2} ${(vh + pad) * 2}`);
  svg.setAttribute('class', `plano${mini ? ' plano--mini' : ''}${turn ? ' is-turned' : ''}`);
  svg.setAttribute('role', 'group');
  svg.setAttribute('tabindex', '-1');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-label', `Mapa del ${venueOf(match).name}`);
  svg.innerHTML = `
    <defs><pattern id="hatch-${match.id}${mini ? '-m' : ''}" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="3" height="3" fill="#0f1524"/><line x1="0" y1="0" x2="0" y2="3" stroke="#1d2638" stroke-width="1.2"/></pattern></defs>
    <g${turn ? ' transform="rotate(90)"' : ''}>
      ${pitchSVG()}
      <g class="plano__blocks">${blocks
        .map((b, i) => {
          const fill = b.cat ? priceColor(match, b.cat) : `url(#hatch-${match.id}${mini ? '-m' : ''})`;
          const focus = interactive && b.cat ? 'tabindex="0"' : '';
          const aria = !interactive ? 'aria-hidden="true"'
            : b.cat ? `role="button" aria-label="${esc(b.name)}, ${esc(b.position)}, ${esc(money(b.cat.price))} por entrada"`
              : `role="img" aria-label="${esc(b.name)}, ${esc(b.position)}, sin venta"`;
          return `<path class="blk${b.cat ? '' : ' is-closed'}" d="${pathD(b.poly)}" fill="${fill}"
            data-id="${b.id}" data-cat="${b.cat ? b.cat.id : ''}" style="--i:${i}" ${focus} ${aria}/>`;
        })
        .join('')}</g>
      ${labels ? `<g class="plano__labels" aria-hidden="true">${priceLabels(match, blocks, turn)}${standLabels(match, turn)}</g>` : ''}
    </g>`;
  el.append(svg);

  const byId = new Map(blocks.map((b) => [b.id, b]));
  const paths = [...svg.querySelectorAll('.blk')];

  function paint({ hotId = null, catId = null } = {}) {
    const hot = hotId ? byId.get(hotId) : null;
    const focusCat = hot?.cat?.id || catId;
    svg.classList.toggle('is-hovering', Boolean(hot || catId));
    paths.forEach((p) => {
      p.classList.toggle('is-hot', p.dataset.id === hotId);
      p.classList.toggle('is-kin', Boolean(focusCat && p.dataset.cat === focusCat && p.dataset.id !== hotId));
    });
  }

  function setSelected(id) {
    paths.forEach((p) => p.classList.toggle('is-sel', p.dataset.id === id));
  }

  function setSelectedCat(catId) {
    paths.forEach((p) => p.classList.toggle('is-sel', p.dataset.cat === catId));
  }

  if (interactive) {
    const blockAt = (e) => byId.get(e.target.closest?.('.blk')?.dataset.id);
    let lastPointer = 'mouse';
    svg.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; });
    // Fingers are wider than a stand: a touch that misses snaps to the nearest stand on sale (24px).
    const nearestOnSale = (x, y) => {
      let best = null;
      let bestD = 24;
      paths.forEach((p) => {
        if (!p.dataset.cat) return;
        const r = p.getBoundingClientRect();
        const dx = Math.max(r.left - x, 0, x - r.right);
        const dy = Math.max(r.top - y, 0, y - r.bottom);
        const d = Math.hypot(dx, dy);
        if (d < bestD) { bestD = d; best = byId.get(p.dataset.id); }
      });
      return best;
    };
    svg.addEventListener('pointermove', (e) => {
      const b = blockAt(e);
      paint({ hotId: b ? b.id : null });
      ctx.onHover?.(b || null, e.clientX, e.clientY);
    });
    svg.addEventListener('pointerleave', () => {
      paint();
      ctx.onHover?.(null);
    });
    svg.addEventListener('click', (e) => {
      let b = blockAt(e);
      if (lastPointer !== 'mouse' && (!b || !b.cat)) b = nearestOnSale(e.clientX, e.clientY) || b;
      if (b) ctx.onPick?.(b);
    });
    svg.addEventListener('focusin', (e) => {
      const b = blockAt(e);
      if (!b) return;
      const r = e.target.getBoundingClientRect();
      paint({ hotId: b.id });
      ctx.onHover?.(b, r.right, r.top);
    });
    svg.addEventListener('focusout', () => {
      paint();
      ctx.onHover?.(null);
    });
    svg.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const b = blockAt(e);
      if (b) {
        e.preventDefault();
        ctx.onPick?.(b);
      }
    });
  }

  return {
    highlightCat: (catId) => paint({ catId }),
    setSelected,
    setSelectedCat,
    destroy() {
      svg.remove();
    },
  };
}
