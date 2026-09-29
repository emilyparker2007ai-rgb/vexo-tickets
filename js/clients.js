// "Clientes que ya fueron": real deliveries from the Vexo album (QR codes pixelated).
// Captions only state what the photo shows: match, sector and date. No invented names or quotes.
export const CLIENTS = Object.freeze([
  { img: 'cliente-055.jpg', match: 'Argentina vs Zambia', date: '31/03/2026', sector: 'Popular Sur Baja', text: 'Con la 10 puesta y la entrada en la mano. Así sí.' },
  { img: 'cliente-029.jpg', match: 'Argentina vs Mauritania', date: '26/03/2026', sector: 'Norte Baja', text: 'Dos entradas y una sonrisa que no le entraba en la cara.' },
  { img: 'cliente-038.jpg', match: 'Argentina vs Mauritania', date: '27/03/2026', sector: null, text: 'Llegaron con la valija y se fueron con las entradas.' },
  { img: 'cliente-032.jpg', match: 'Argentina vs Mauritania', date: '26/03/2026', sector: 'Entrada digital', text: 'Entrada transferida al celular. El perro también quiso salir en la foto.' },
  { img: 'cliente-046.jpg', match: 'Argentina vs Zambia', date: '30/03/2026', sector: 'Popular Norte Baja', text: 'Pulgar arriba y a la cancha.' },
  { img: 'cliente-035.jpg', match: 'Argentina vs Mauritania', date: '27/03/2026', sector: null, text: 'Los dos con el pulgar arriba y la entrada en la mano.' },
  { img: 'cliente-020.jpg', match: 'Copa Argentina 2026', date: '23/02/2026', sector: 'Platea Cubierta', text: 'Platea cubierta para ver a Boca en la Copa Argentina.' },
  { img: 'cliente-034.jpg', match: 'Argentina vs Mauritania', date: '27/03/2026', sector: null, text: 'Entrega en pleno centro porteño, cara a cara.' },
]);

// Matches the album shows we delivered for (checked item by item in 04-material-album.md).
export const SOLD = Object.freeze([
  { when: 'Sep 2025', what: 'Argentina vs Venezuela', where: 'Monumental' },
  { when: 'Mar 2026', what: 'Argentina vs Mauritania', where: 'La Bombonera' },
  { when: 'Mar 2026', what: 'Argentina vs Zambia', where: null },
  { when: 'Jun-Jul 2026', what: 'Mundial 2026, hasta la final', where: 'Estados Unidos, México y Canadá' },
  { when: '2025-2026', what: 'Copa Argentina: River, Boca y Racing', where: 'varias sedes' },
]);

// Success cases for the slider under the intro. Captions only state what each photo shows.
export const CASES = Object.freeze([
  { img: 'caso-045.jpg', match: 'Argentina vs Zambia', sector: 'Popular Norte Baja', date: '30/03', text: 'Llegó con la de Marsella y se fue con la de la Selección.' },
  { img: 'caso-083.jpg', match: 'River · Copa Argentina', sector: 'Popular Sur', date: '17/07', text: 'Dos populares, casco en mano y a la cancha.' },
  { img: 'caso-048.jpg', match: 'Argentina vs Zambia', sector: 'Popular Norte Baja', date: '30/03', text: 'Entrega a la pasada, sin bajarse del auto.' },
  { img: 'caso-082.jpg', match: 'River · Copa Argentina', sector: 'Popular Norte', date: '17/07', text: 'Cuatro populares juntas, en una sola entrega.' },
  { img: 'caso-047.jpg', match: 'Argentina vs Zambia', sector: 'Popular Norte Baja', date: '30/03', text: 'Entrada original en mano, lista para el partido.' },
  { img: 'caso-021.jpg', match: 'Boca · Copa Argentina', sector: 'Platea Cubierta', date: '23/02', text: 'Platea para ver a Boca, entregada en el auto.' },
]);
