// Stadium geometry. World units are meters-ish, origin at the center spot, y grows downward.
import { VENUES } from './data.js';

const EXP = 2 / 5; // superellipse exponent: squarish bowl with rounded corners
const DEG = Math.PI / 180;
const GAP = 1.3 * DEG;

export const PITCH = Object.freeze({ hw: 52.5, hh: 34 });

export function ringPoint(theta, a, b) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [a * Math.sign(c) * Math.abs(c) ** EXP, b * Math.sign(s) * Math.abs(s) ** EXP];
}

function arcPoints(t1, t2, a, b, steps) {
  return Array.from({ length: steps + 1 }, (_, i) => ringPoint(t1 + ((t2 - t1) * i) / steps, a, b));
}

export function extents(venue) {
  const maxD = Math.max(...venue.tiers.map((t) => t.d[1]));
  return [venue.inner[0] + maxD, venue.inner[1] + maxD];
}

// Human position inside a stand: corner, three-quarters, midfield, behind the goal.
function positionName(side, k) {
  const [first, last] = side.ends;
  if (side.kind === 'end') return ['Lado ' + first, 'Detrás del arco', 'Lado ' + last][k];
  return ['Córner ' + first, 'Tres cuartos ' + first, 'Mitad de cancha', 'Tres cuartos ' + last, 'Córner ' + last][k];
}

export function buildBlocks(match) {
  const venue = VENUES[match.venue];
  const [a0, b0] = venue.inner;
  const cats = new Map(match.cats.map((c) => [c.id, c]));
  const closed = venue.closed || {};
  const blocks = [];
  venue.sides.forEach((side) => {
    const r1 = side.range[0] * DEG;
    const span = ((side.range[1] - side.range[0]) * DEG) / side.blocks;
    venue.tiers.forEach((tier, ti) => {
      const catId = venue.map[side.id][ti];
      for (let k = 0; k < side.blocks; k++) {
        const t1 = r1 + span * k + GAP / 2;
        const t2 = r1 + span * (k + 1) - GAP / 2;
        const [d1, d2] = tier.d;
        const outer = arcPoints(t1, t2, a0 + d2, b0 + d2, 10);
        const inner = arcPoints(t1, t2, a0 + d1, b0 + d1, 10).reverse();
        const tc = (t1 + t2) / 2;
        const dc = (d1 + d2) / 2;
        const cat = catId ? cats.get(catId) || null : null;
        blocks.push({
          id: `${side.id}${ti}${k}`,
          side,
          tier,
          ti,
          k,
          cat,
          name: venue.names[side.id][ti],
          position: positionName(side, k),
          unavailable: cat ? null : (catId ? 'Sin entradas de Vexo en este sector' : closed[side.id] || 'Sin venta para este partido'),
          poly: [...outer, ...inner],
          center: ringPoint(tc, a0 + dc, b0 + dc),
          tc,
        });
      }
    });
  });
  return blocks;
}

// Pitch markings as polylines in world units.
export function pitchLines() {
  const { hw, hh } = PITCH;
  const circle = (cx, cy, r, a1 = 0, a2 = Math.PI * 2, n = 48) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = a1 + ((a2 - a1) * i) / n;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  const box = (x1, y1, x2, y2) => [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
  const arcA = Math.acos(5.5 / 9.15); // the "D": part of the spot circle outside the box
  return [
    box(-hw, -hh, hw, hh),
    [[0, -hh], [0, hh]],
    circle(0, 0, 9.15),
    box(-hw, -20.15, -hw + 16.5, 20.15),
    box(hw - 16.5, -20.15, hw, 20.15),
    box(-hw, -9.15, -hw + 5.5, 9.15),
    box(hw - 5.5, -9.15, hw, 9.15),
    circle(-hw + 11, 0, 9.15, -arcA, arcA, 16),
    circle(hw - 11, 0, 9.15, Math.PI - arcA, Math.PI + arcA, 16),
  ];
}
