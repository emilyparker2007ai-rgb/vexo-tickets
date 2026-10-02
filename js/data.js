// Vexo Tickets data.
// Vexo prices: Pedro (BRC), 2026-09-28, final price per ticket in ARS.
// Kickoffs and venues: afa.com.ar, verified 2026-09-28.
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
    id: 'bol',
    rival: 'Bolivia',
    flag: 'bol',
    nickname: 'La Verde',
    kickoff: '2026-09-30T21:00:00-03:00',
    venue: 'kempes',
    result: null, // e.g. { arg: 2, rival: 0 } once played
    theme: { a: '#d52b1e', b: '#f9e300', c: '#007934' },
    headline: 'Córdoba se viste de celeste',
    subline: 'Esta vez La Verde juega sin la altura de La Paz. Miércoles a la noche, en el Kempes.',
    cats: [
      cat('popular', 'Populares', 100000, 83152, 'Popular Willington, detrás del arco norte', 'De pie, al lado del arco, donde se canta todo el partido.'),
      cat('gasparini', 'Plateas Gasparini', 140000, 151161, 'Platea Gasparini Baja, lateral este', 'Sentado, de costado a la cancha, con la jugada a la vista.'),
      cat('ardiles', 'Plateas Ardiles', 170000, 192408, 'Platea Ardiles, lateral oeste', 'La platea principal: la mejor vista de la cancha completa.'),
    ],
  },
  {
    id: 'bfa',
    rival: 'Burkina Faso',
    flag: 'bfa',
    nickname: 'Les Étalons',
    kickoff: '2026-10-03T21:00:00-03:00',
    venue: 'monumental',
    result: null,
    theme: { a: '#ef2b2d', b: '#fcd116', c: '#009e49' },
    headline: 'Sábado a la noche, en Núñez',
    subline: 'Llegan Les Étalons desde Burkina Faso. Nosotros ponemos la cancha llena.',
    cats: [
      cat('popular', 'Populares', 100000, 119989, 'Sívori Baja y Centenario Baja, detrás de los arcos', 'De pie, bien cerca del arco, en el corazón del aliento.'),
      cat('alta', 'Plateas altas', 200000, 228767, 'Plateas altas de las cuatro tribunas', 'Desde arriba se ve toda la cancha, como en la tele pero en vivo.'),
      cat('baja', 'Plateas bajas', 300000, 818330, 'Platea San Martín Baja y Platea Belgrano Baja, laterales', 'A pocos metros del césped: escuchás la pelota y a los jugadores.'),
    ],
  },
  {
    id: 'ben',
    rival: 'Benín',
    flag: 'ben',
    nickname: 'Les Guépards',
    kickoff: '2026-10-06T20:00:00-03:00',
    venue: 'monumental',
    result: null,
    theme: { a: '#e8112d', b: '#fcd116', c: '#008751' },
    headline: 'La noche que nadie se quiere perder',
    subline: 'En la boletería oficial se agotó en menos de dos horas. Nosotros todavía te conseguimos lugar.',
    cats: [
      cat('popular', 'Populares', 300000, 639031, 'Sívori Baja y Centenario Baja, detrás de los arcos', 'De pie, bien cerca del arco, en el corazón del aliento.'),
      cat('alta', 'Plateas altas', 400000, 723913, 'Plateas altas de las cuatro tribunas', 'Desde arriba se ve toda la cancha, como en la tele pero en vivo.'),
      cat('media', 'Plateas medias', 600000, 808396, 'Plateas medias de las cuatro tribunas', 'El punto justo: cerca y con toda la cancha a la vista.'),
      cat('baja', 'Plateas bajas', 700000, 1637003, 'Platea San Martín Baja y Platea Belgrano Baja, laterales', 'A pocos metros del césped: escuchás la pelota y a los jugadores.'),
    ],
  },
]);
