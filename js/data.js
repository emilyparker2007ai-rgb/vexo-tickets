// Vexo Tickets data.
// Superclasico: Boca vs River, Sunday 2026-11-01 15:00 ART, La Bombonera, Torneo Clausura round 15
// (Liga Profesional, reported 2026-10-08 by Canal 26 and others). Prices not published yet: null = "a confirmar".
// Market reference: cheapest StubHub listing per sector, 2026-09-28 13:10-13:32 ART, fees excluded.
// Stand orientation: Sivori north, Centenario south, San Martin west, Belgrano east (Monumental);
// Willington north, Artime south, Gasparini east, Ardiles west (Kempes).

export const WHATSAPP_NUMBER = '5491153743446'; // digits only, country + area + number, e.g. 5491100000000
export const INSTAGRAM_URL = '';
export const MARKET_LABEL = 'StubHub';
export const MARKET_DATE = '28/09';
export const MAX_TICKETS = 4;

// Geometry sides: E = right end, W = left end, N = top side, S = bottom side of the drawn map.
// Both stadiums are drawn the same way: north on the left, east on top (north up once turned on phones).
// `ends` names the neighbour at the first and last block of each side (for corner names).
export const VENUES = Object.freeze({
  monumental: {
    name: 'Estadio Monumental',
    short: 'Monumental',
    city: 'Buenos Aires',
    inner: [62, 44],
    tiers: [
      { id: 'baja', label: 'Baja', d: [0, 12] },
      { id: 'media', label: 'Media', d: [14, 25] },
      { id: 'alta', label: 'Alta', d: [27, 40] },
    ],
    sides: [
      { id: 'E', name: 'Centenario', kind: 'end', range: [-38, 38], blocks: 3, ends: ['Belgrano', 'San Martín'] },
      { id: 'S', name: 'San Martín', kind: 'side', range: [52, 128], blocks: 5, ends: ['Centenario', 'Sívori'] },
      { id: 'W', name: 'Sívori', kind: 'end', range: [142, 218], blocks: 3, ends: ['San Martín', 'Belgrano'] },
      { id: 'N', name: 'Belgrano', kind: 'side', range: [232, 308], blocks: 5, ends: ['Sívori', 'Centenario'] },
    ],
    // price category per side and tier (index 0 = lowest tier)
    map: {
      E: ['popular', 'media', 'alta'],
      W: ['popular', 'media', 'alta'],
      N: ['baja', 'media', 'alta'],
      S: ['baja', 'media', 'alta'],
    },
    // technical name printed on the ticket, per side and tier
    names: {
      E: ['Centenario Baja', 'Centenario Media', 'Centenario Alta'],
      W: ['Sívori Baja', 'Sívori Media', 'Sívori Alta'],
      N: ['Platea Belgrano Baja', 'Platea Belgrano Media', 'Platea Belgrano Alta'],
      S: ['Platea San Martín Baja', 'Platea San Martín Media', 'Platea San Martín Alta'],
    },
  },
  // La Bombonera: names as printed on real tickets (Norte Baja, Sur Media, Platea Baja). Drawing is illustrative.
  bombonera: {
    name: 'La Bombonera',
    short: 'La Bombonera',
    city: 'Buenos Aires',
    inner: [62, 44],
    tiers: [
      { id: 'baja', label: 'Baja', d: [0, 12] },
      { id: 'media', label: 'Media', d: [14, 25] },
      { id: 'alta', label: 'Alta', d: [27, 40] },
    ],
    sides: [
      { id: 'E', name: 'Sur', kind: 'end', range: [-38, 38], blocks: 3, ends: ['Palcos', 'Platea'] },
      { id: 'S', name: 'Platea', kind: 'side', range: [52, 128], blocks: 5, ends: ['Sur', 'Norte'] },
      { id: 'W', name: 'Norte', kind: 'end', range: [142, 218], blocks: 3, ends: ['Platea', 'Palcos'] },
      { id: 'N', name: 'Palcos', kind: 'side', range: [232, 308], blocks: 5, ends: ['Norte', 'Sur'] },
    ],
    map: {
      E: ['populares', 'populares', 'populares'],
      W: ['populares', 'populares', 'populares'],
      S: ['plateas', 'plateas', 'plateas'],
      N: ['palcos', 'palcos', 'palcos'],
    },
    names: {
      E: ['Sur Baja', 'Sur Media', 'Sur Alta'],
      W: ['Norte Baja', 'Norte Media', 'Norte Alta'],
      S: ['Platea Baja', 'Platea Media', 'Platea Alta'],
      N: ['Palcos', 'Palcos', 'Palcos'],
    },
  },
  kempes: {
    name: 'Estadio Mario Alberto Kempes',
    short: 'Kempes',
    city: 'Córdoba',
    inner: [62, 44],
    tiers: [
      { id: 'baja', label: 'Baja', d: [0, 15] },
      { id: 'alta', label: 'Alta', d: [17, 36] },
    ],
    sides: [
      { id: 'E', name: 'Artime', kind: 'end', range: [-38, 38], blocks: 3, ends: ['Gasparini', 'Ardiles'] },
      { id: 'S', name: 'Ardiles', kind: 'side', range: [52, 128], blocks: 5, ends: ['Artime', 'Willington'] },
      { id: 'W', name: 'Willington', kind: 'end', range: [142, 218], blocks: 3, ends: ['Ardiles', 'Gasparini'] },
      { id: 'N', name: 'Gasparini', kind: 'side', range: [232, 308], blocks: 5, ends: ['Willington', 'Artime'] },
    ],
    map: {
      E: [null, null],
      W: ['popular', 'popular'],
      N: ['gasparini', null],
      S: ['ardiles', 'ardiles'],
    },
    names: {
      E: ['Popular Artime', 'Popular Artime'],
      W: ['Popular Willington', 'Popular Willington'],
      N: ['Platea Gasparini Baja', 'Platea Gasparini Alta'],
      S: ['Platea Ardiles Baja', 'Platea Ardiles Alta'],
    },
    closed: { E: 'Sin venta para este partido', N: 'Reservada, sin venta al público' },
  },
});

function cat(id, label, price, market, where, feel) {
  return Object.freeze({ id, label, price, market, where, feel });
}

export const MATCHES = Object.freeze([
  {
    id: 'sc',
    home: 'Boca',
    homeFlag: 'boca',
    rival: 'River',
    flag: 'river',
    nickname: 'Superclásico',
    competition: 'Torneo Clausura 2026 · Fecha 15',
    kickoff: '2026-11-01T15:00:00-03:00',
    venue: 'bombonera',
    result: null, // e.g. { home: 2, rival: 1 } once played
    theme: { a: '#103f8f', b: '#f6c21c', c: '#e1202e' },
    headline: 'El partido que frena al país',
    subline: 'Domingo 1 de noviembre a las 15:00 en La Bombonera. Elegí tu sector y te confirmamos lugar y precio por WhatsApp.',
    cats: [
      cat('populares', 'Populares', null, null, 'Norte y Sur, detrás de los arcos', 'De pie, en el corazón del aliento, con la cancha temblando.'),
      cat('plateas', 'Plateas', null, null, 'Platea Baja, Media y Alta, lateral', 'Sentado, de costado a la cancha, con todo el partido a la vista.'),
      cat('palcos', 'Palcos', null, null, 'Lado de los palcos', 'La experiencia más cómoda de La Bombonera.'),
    ],
  },
]);
