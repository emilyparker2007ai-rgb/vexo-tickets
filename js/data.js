// Vexo Tickets data.
// Fixtures: Liga Profesional, "Agenda de la 13 a la 15" (ligaprofesional.ar, 2026-10-07), checked 2026-10-13.
// Matches are played at the home club's stadium unless the league says otherwise. Prices are not published:
// null = "A confirmar" (confirmed on WhatsApp). There is no away public in Argentine league football.
// Stand orientation: Sivori north, Centenario south, San Martin west, Belgrano east (Monumental).

export const WHATSAPP_NUMBER = '5491153743446'; // digits only, country + area + number
export const INSTAGRAM_URL = '';
export const MARKET_LABEL = 'StubHub';
export const MARKET_DATE = '28/09';
export const MAX_TICKETS = 4;

// Club colors for the round badges (drawn from colors, no crests): pattern + colors.
export const CLUBS = Object.freeze({
  arg: { name: 'Argentina', pattern: 'vstripes', colors: ['#74acdf', '#ffffff'] },
  boca: { name: 'Boca', pattern: 'hband', colors: ['#103f8f', '#f6c21c'] },
  river: { name: 'River', pattern: 'sash', colors: ['#ffffff', '#e1202e'] },
  racing: { name: 'Racing', pattern: 'vstripes', colors: ['#6cb4ee', '#ffffff'] },
  independiente: { name: 'Independiente', pattern: 'solid', colors: ['#d4162c', '#ffffff'] },
  estudiantes: { name: 'Estudiantes', pattern: 'vstripes', colors: ['#d4162c', '#ffffff'] },
  sanlorenzo: { name: 'San Lorenzo', pattern: 'vstripes', colors: ['#1d3a8a', '#c8102e'] },
  belgrano: { name: 'Belgrano', pattern: 'solid', colors: ['#5fb7e8', '#ffffff'] },
  talleres: { name: 'Talleres', pattern: 'vstripes', colors: ['#0b2a6f', '#ffffff'] },
  newells: { name: "Newell's", pattern: 'halves', colors: ['#d4162c', '#111111'] },
  velez: { name: 'Vélez', pattern: 'chevron', colors: ['#ffffff', '#0a3d91'] },
});

// Generic stadium: home popular behind one goal, plateas on the sides, away end closed.
function stadium(name, short, city) {
  return {
    name,
    short,
    city,
    generic: true,
    inner: [62, 44],
    tiers: [
      { id: 'baja', label: 'Baja', d: [0, 15] },
      { id: 'alta', label: 'Alta', d: [17, 34] },
    ],
    sides: [
      { id: 'E', name: 'Popular', kind: 'end', range: [-38, 38], blocks: 3, ends: ['Preferencial', 'Platea'] },
      { id: 'S', name: 'Platea', kind: 'side', range: [52, 128], blocks: 5, ends: ['Popular', 'Visitante'] },
      { id: 'W', name: 'Visitante', kind: 'end', range: [142, 218], blocks: 3, ends: ['Platea', 'Preferencial'] },
      { id: 'N', name: 'Preferencial', kind: 'side', range: [232, 308], blocks: 5, ends: ['Visitante', 'Popular'] },
    ],
    map: {
      E: ['populares', 'populares'],
      W: [null, null],
      S: ['plateas', 'plateas'],
      N: ['preferencial', 'preferencial'],
    },
    names: {
      E: ['Popular local', 'Popular local alta'],
      W: ['Cabecera visitante', 'Cabecera visitante'],
      S: ['Platea Baja', 'Platea Alta'],
      N: ['Platea Preferencial Baja', 'Platea Preferencial Alta'],
    },
    closed: { W: 'Sin público visitante' },
  };
}

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
  cilindro: stadium('Estadio Presidente Perón (El Cilindro)', 'El Cilindro', 'Avellaneda'),
  uno: stadium('Estadio UNO Jorge Luis Hirschi', 'Estadio UNO', 'La Plata'),
  gigante: stadium('Estadio Julio César Villagra (Gigante de Alberdi)', 'Gigante de Alberdi', 'Córdoba'),
  gasometro: stadium('Estadio Pedro Bidegain (Nuevo Gasómetro)', 'Nuevo Gasómetro', 'Buenos Aires'),
  libertadores: stadium('Estadio Libertadores de América', 'Libertadores de América', 'Avellaneda'),
  amalfitani: stadium('Estadio José Amalfitani', 'José Amalfitani', 'Buenos Aires'),
});

function cat(id, label, price, market, where, feel, short = null) {
  return Object.freeze({ id, label, price, market, where, feel, short: short || label });
}

const GENERIC_CATS = [
  cat('populares', 'Populares', null, null, 'Popular local, detrás del arco', 'De pie, en el corazón del aliento.'),
  cat('plateas', 'Plateas', null, null, 'Platea Baja y Alta, lateral', 'Sentado, de costado a la cancha, con todo el partido a la vista.'),
  cat('preferencial', 'Plateas preferenciales', null, null, 'Lateral principal', 'La mejor vista de la cancha, con más comodidad.', 'Preferencial'),
];
const BOMBONERA_CATS = [
  cat('populares', 'Populares', null, null, 'Norte y Sur, detrás de los arcos', 'De pie, en el corazón del aliento, con la cancha temblando.'),
  cat('plateas', 'Plateas', null, null, 'Platea Baja, Media y Alta, lateral', 'Sentado, de costado a la cancha, con todo el partido a la vista.'),
  cat('palcos', 'Palcos', null, null, 'Lado de los palcos', 'La experiencia más cómoda de La Bombonera.'),
];
const MONUMENTAL_CATS = [
  cat('popular', 'Populares', null, null, 'Sívori Baja y Centenario Baja, detrás de los arcos', 'De pie, bien cerca del arco, en el corazón del aliento.'),
  cat('alta', 'Plateas altas', null, null, 'Plateas altas de las cuatro tribunas', 'Desde arriba se ve toda la cancha.'),
  cat('media', 'Plateas medias', null, null, 'Plateas medias de las cuatro tribunas', 'El punto justo: cerca y con toda la cancha a la vista.'),
  cat('baja', 'Plateas bajas', null, null, 'Platea San Martín Baja y Platea Belgrano Baja, laterales', 'A pocos metros del césped.'),
];
const CATS_BY_VENUE = { bombonera: BOMBONERA_CATS, monumental: MONUMENTAL_CATS };

function fx(id, home, away, kickoff, venue, round, headline, tags = []) {
  const h = CLUBS[home];
  const a = CLUBS[away];
  const light = (c) => c.toLowerCase() === '#ffffff';
  return {
    id,
    home: h.name,
    homeFlag: home,
    rival: a.name,
    flag: away,
    nickname: tags.includes('clasico') ? 'Clásico' : 'Liga Profesional',
    competition: `Torneo Clausura 2026 · ${round}`,
    kickoff,
    venue,
    media: 'sc',
    tags: ['liga', ...tags, home, away],
    result: null,
    theme: { a: h.colors[0], b: light(h.colors[1]) ? '#eef2f7' : h.colors[1], c: light(a.colors[0]) ? a.colors[1] : a.colors[0] },
    headline,
    subline: `Elegí tu sector y te confirmamos lugar y precio por WhatsApp. Pagás en el momento en que te entregamos la entrada.`,
    cats: CATS_BY_VENUE[venue] || GENERIC_CATS,
  };
}

export const MATCHES = Object.freeze([
  fx('bot', 'boca', 'talleres', '2026-10-16T21:30:00-03:00', 'bombonera', 'Fecha 13', 'Viernes de Bombonera'),
  fx('rai', 'racing', 'independiente', '2026-10-18T14:45:00-03:00', 'cilindro', 'Fecha 13', 'El clásico de Avellaneda', ['clasico']),
  fx('esl', 'estudiantes', 'sanlorenzo', '2026-10-18T18:00:00-03:00', 'uno', 'Fecha 13', 'Domingo en La Plata'),
  fx('ber', 'belgrano', 'river', '2026-10-18T20:15:00-03:00', 'gigante', 'Fecha 13', 'River visita al Gigante'),
  fx('sln', 'sanlorenzo', 'newells', '2026-10-24T19:15:00-03:00', 'gasometro', 'Fecha 14', 'Noche de Gasómetro'),
  fx('inb', 'independiente', 'boca', '2026-10-25T17:00:00-03:00', 'libertadores', 'Fecha 14', 'Boca visita Avellaneda', ['clasico']),
  fx('rir', 'river', 'racing', '2026-10-25T19:15:00-03:00', 'monumental', 'Fecha 14', 'Domingo de Monumental'),
  fx('vsl', 'velez', 'sanlorenzo', '2026-10-31T19:15:00-03:00', 'amalfitani', 'Fecha 15', 'Sábado en Liniers'),
  fx('sc', 'boca', 'river', '2026-11-01T15:00:00-03:00', 'bombonera', 'Fecha 15', 'El partido que frena al país', ['clasico']),
]);

// Selección: November FIFA window (9 to 17/11/2026), opponent and venue not announced yet (La Nación, 07/10).
export const UPCOMING_SELECCION = Object.freeze({
  title: 'Selección Argentina',
  when: 'Fecha FIFA de noviembre · 9 al 17/11',
  note: 'Rival y sede a confirmar por la AFA. Anotate y te avisamos primero.',
});
