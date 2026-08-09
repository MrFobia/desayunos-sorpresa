/**
 * Semilla de la base de datos.
 * Los 8 desayunos y sus precios vienen de las fotos del cuaderno del cliente
 * (Desktop/Desayunos, 07-ago-2026). Cualquier ítem que no se leía con claridad
 * está marcado con `needsReview: true` para confirmarlo con el cliente.
 *
 *   node server/seed.js          -> crea db.json si no existe
 *   node server/seed.js --force  -> lo reescribe desde cero
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, 'db.json');

const img = (name) => `/img/${name}.jpg`;

const products = [
  {
    id: 'p1',
    slug: 'despertar-sencillo',
    name: 'Despertar Sencillo',
    price: 50000,
    compareAt: null,
    category: 'clasicos',
    tagline: 'El primer desayuno de la casa. Panqueques, jugo y una nota escrita a mano.',
    description:
      'Nuestro desayuno de entrada: mini panqueques recién hechos con miel, jugo de naranja exprimido esa misma mañana y fruta cortada al momento. Va con cubiertos, servilleta de tela y una tarjeta que escribimos a mano con tu mensaje.',
    images: ['french-toast-banano', 'jugo-naranja', 'yogurt-granola'].map(img),
    includes: [
      { name: 'Jugo de naranja natural', detail: '350 ml, exprimido el mismo día' },
      { name: 'Mini panqueques con miel', detail: '4 unidades' },
      { name: 'Fruta de temporada', detail: 'corte del día' },
      { name: 'Mermelada y mantequilla', detail: 'porción individual' },
      { name: 'Cubiertos y servilleta', detail: 'incluidos' },
      { name: 'Tarjeta personalizada', detail: 'escrita a mano con tu mensaje' },
    ],
    serves: 1,
    badges: ['Más vendido'],
    featured: true,
    active: true,
    prepNote: 'Se arma la madrugada de la entrega. Pedidos hasta las 8:00 p. m. del día anterior.',
  },
  {
    id: 'p2',
    slug: 'manana-dulce',
    name: 'Mañana Dulce',
    price: 60000,
    compareAt: null,
    category: 'dulces',
    tagline: 'Yogurt griego, fresa, kiwi y galleta artesanal.',
    description:
      'Para quien prefiere empezar liviano pero con azúcar honesta: yogurt griego con fresa y kiwi frescos, galleta artesanal horneada por una panadería del barrio y jugo de naranja.',
    images: ['yogurt-granola', 'smoothie-fresa', 'bowl-frutas-coco'].map(img),
    includes: [
      { name: 'Jugo de naranja natural', detail: '350 ml' },
      { name: 'Yogurt griego', detail: 'vaso de 200 g' },
      { name: 'Fresas y kiwi', detail: 'cortados al momento' },
      { name: 'Galleta artesanal', detail: 'horneada el mismo día' },
    ],
    serves: 1,
    badges: [],
    featured: true,
    active: true,
    prepNote: 'Viaja en frío hasta tu puerta.',
  },
  {
    id: 'p3',
    slug: 'zen-morning',
    name: 'Zen Morning',
    price: 65000,
    compareAt: null,
    category: 'saludables',
    tagline: 'Jugo verde, tostadas de aguacate y frutos secos.',
    description:
      'El desayuno de los que entrenan temprano. Jugo verde de espinaca, manzana y pepino; tostadas de pan de masa madre con aguacate; frutos secos y una tabla de fruta con kiwi, piña y arándanos.',
    images: ['aguacate-huevo-dark', 'bowl-aguacate', 'bowl-frutas-azul'].map(img),
    includes: [
      { name: 'Jugo verde', detail: 'espinaca, manzana y pepino · 350 ml' },
      { name: 'Tostadas de aguacate', detail: '2 unidades en masa madre' },
      { name: 'Frutos secos', detail: 'almendra, marañón y nuez' },
      { name: 'Fruta fresca', detail: 'kiwi, piña y arándanos' },
    ],
    serves: 1,
    badges: ['Sin azúcar añadida'],
    featured: true,
    active: true,
    prepNote: 'El jugo verde se hace 40 minutos antes de salir.',
  },
  {
    id: 'p4',
    slug: 'desayuno-mini-explorador',
    name: 'Desayuno Mini Explorador',
    price: 70000,
    compareAt: null,
    category: 'infantiles',
    tagline: 'Panqueques con chispas, brocheta de frutas y una sorpresa adentro.',
    description:
      'Pensado para niños. Panqueques con toppings a elegir (miel, chispas de chocolate, rodajas de banano), brocheta de frutas, jugo, un yogurt pequeño y una sorpresa escondida en la caja.',
    images: ['french-toast-banano', 'banano-rosa', 'jugo-naranja'].map(img),
    includes: [
      { name: 'Panqueques', detail: '4 unidades' },
      { name: 'Toppings', detail: 'miel, chispas de chocolate y banano en rodajas' },
      { name: 'Brocheta de frutas', detail: '2 unidades' },
      { name: 'Jugo', detail: '250 ml' },
      { name: 'Yogurt pequeño', detail: '150 g' },
      { name: 'Sorpresa', detail: 'juguete o dulce sorpresa según edad' },
    ],
    serves: 1,
    badges: ['Para niños'],
    featured: false,
    active: true,
    prepNote: 'Contanos la edad en las notas del pedido y ajustamos la sorpresa.',
  },
  {
    id: 'p5',
    slug: 'cesta-campestre',
    name: 'Cesta Campestre',
    price: 75000,
    compareAt: null,
    category: 'clasicos',
    tagline: 'Panadería, queso campesino, waffle integral y té.',
    description:
      'Una cesta larga para desayunar sin prisa: pan integral, croissant, waffle integral, queso campesino, buñuelitos, fruta fresca con kiwi, fresa y mango, y una selección de tés.',
    images: ['waffles-frutas', 'panes-artesanales', 'tostada-huevo'].map(img),
    includes: [
      { name: 'Jugo natural', detail: '350 ml' },
      { name: 'Pan integral y croissant', detail: 'de panadería local' },
      { name: 'Waffle integral', detail: '1 unidad' },
      { name: 'Queso campesino', detail: 'porción de 150 g' },
      { name: 'Fruta fresca', detail: 'kiwi, fresa y mango' },
      { name: 'Selección de tés', detail: '3 sobres' },
      { name: 'Buñuelitos', detail: '4 unidades' },
    ],
    serves: 2,
    badges: ['Alcanza para dos'],
    featured: true,
    active: true,
    prepNote: 'Va en cesta de mimbre que se queda con quien lo recibe.',
  },
  {
    id: 'p6',
    slug: 'detox-box',
    name: 'Detox Box',
    price: 80000,
    // Precio tachado de ejemplo para que la sección Ofertas tenga contenido.
    // Se cambia o se borra desde el panel; no es un descuento acordado.
    compareAt: 92000,
    category: 'saludables',
    tagline: 'Jugo de coco y jengibre, shot de limón, granola y cítricos.',
    description:
      'La caja de los lunes. Jugo de coco con jengibre y limón, frutas cítricas, yogurt griego con granola, un shot de jengibre y limón, galleta integral de avena y bolitas de queso.',
    images: ['bowl-frutas-coco', 'bowl-frutas-azul', 'smoothie-fresa'].map(img),
    includes: [
      { name: 'Jugo de coco, jengibre y limón', detail: '350 ml' },
      { name: 'Frutas cítricas', detail: 'naranja, mandarina y toronja' },
      { name: 'Yogurt griego con granola', detail: '200 g' },
      { name: 'Shot de jengibre y limón', detail: '60 ml' },
      { name: 'Galleta integral de avena', detail: '2 unidades' },
      { name: 'Bolitas de queso', detail: '4 unidades', needsReview: true },
    ],
    serves: 1,
    badges: ['Sin azúcar añadida'],
    featured: false,
    active: true,
    prepNote: 'El shot viaja aparte, en botella sellada.',
  },
  {
    id: 'p7',
    slug: 'amanecer-romantico',
    name: 'Amanecer Romántico',
    price: 90000,
    compareAt: null,
    category: 'romanticos',
    tagline: 'Fresas con crema, croissants rellenos de chocolate y jugo de frutos rojos.',
    description:
      'El desayuno de aniversario. Jugo de frutos rojos y jugo de naranja, fresas con crema, croissants rellenos de chocolate, tabla de quesos y uvas verdes. Se puede pedir con globo y vela.',
    images: ['croissant', 'smoothie-fresa', 'bowl-frutas-coco'].map(img),
    includes: [
      { name: 'Jugo de frutos rojos', detail: '350 ml' },
      { name: 'Jugo de naranja', detail: '350 ml' },
      { name: 'Fresas con crema', detail: 'copa de 250 g' },
      { name: 'Croissants rellenos de chocolate', detail: '2 unidades' },
      { name: 'Tabla de quesos', detail: '3 quesos' },
      { name: 'Uvas verdes', detail: 'racimo' },
    ],
    serves: 2,
    badges: ['Para dos'],
    featured: true,
    active: true,
    prepNote: 'Se entrega con tarjeta manuscrita. Globo y vela se agregan como adicionales.',
  },
  {
    id: 'p8',
    slug: 'brunch-gourmet',
    name: 'Brunch Gourmet',
    price: 100000,
    // Precio tachado de ejemplo — ver la nota en Detox Box.
    compareAt: 115000,
    category: 'gourmet',
    tagline: 'Dos jugos, tabla de galletas y quesos, avena con tocineta.',
    description:
      'El más completo de la carta. Dos jugos, tabla de galletas y quesos, avena con tocineta, fruta fresca, uvas y arándanos, y bolitas de queso. Alcanza cómodo para dos personas.',
    images: ['tostada-huevo', 'waffles-frutas', 'panes-artesanales'].map(img),
    includes: [
      { name: 'Dos jugos naturales', detail: '350 ml cada uno' },
      { name: 'Tabla de galletas y quesos', detail: '4 quesos' },
      { name: 'Avena con tocineta', detail: 'porción caliente', needsReview: true },
      { name: 'Fruta fresca', detail: 'corte del día' },
      { name: 'Uvas y arándanos', detail: 'porción' },
      { name: 'Bolitas de queso', detail: '6 unidades', needsReview: true },
    ],
    serves: 2,
    badges: ['El más completo'],
    featured: false,
    active: true,
    prepNote: 'La avena viaja en termo para llegar caliente.',
  },
];

// Ningún desayuno arranca con reseñas: se cargan desde el panel cuando existan
// opiniones reales. Estrellas inventadas serían mentira en la ficha.
products.forEach((product) => {
  product.reviews = [];
});

const addons = [
  { id: 'a1', name: 'Globo metalizado', price: 12000, category: 'detalle', image: img('banano-rosa'), active: true },
  { id: 'a2', name: 'Ramo de flores pequeño', price: 35000, category: 'detalle', image: img('smoothie-fresa'), active: true },
  { id: 'a3', name: 'Jugo extra', price: 8000, category: 'comida', image: img('jugo-naranja'), active: true },
  { id: 'a4', name: 'Croissant relleno de chocolate', price: 9000, category: 'comida', image: img('croissant'), active: true },
  { id: 'a5', name: 'Porción extra de fruta', price: 10000, category: 'comida', image: img('bowl-frutas-coco'), active: true },
  { id: 'a6', name: 'Vela y fósforos', price: 6000, category: 'detalle', image: img('banano-rosa'), active: true },
  { id: 'a7', name: 'Café de origen (250 g)', price: 28000, category: 'detalle', image: img('panes-artesanales'), active: true },
  { id: 'a8', name: 'Segundo puesto (repite el desayuno)', price: 32000, category: 'comida', image: img('waffles-frutas'), active: true },
];

const posts = [
  {
    id: 'b1',
    slug: 'como-armamos-una-caja',
    title: 'Cómo armamos una caja a las 4 de la mañana',
    excerpt: 'La fruta se corta a las 4:10. El jugo se exprime a las 4:40. La tarjeta se escribe de último, para que la tinta no se corra.',
    cover: img('tabla-ingredientes'),
    author: 'Equipo Aurora',
    date: '2026-07-28',
    published: true,
    body: `La cocina abre a las 3:40 a. m. No es romanticismo: un desayuno que sale a las 6:00 tiene que armarse en ese orden exacto o llega tibio.\n\nPrimero la fruta. Se corta entera, nunca la noche anterior, porque la piña suelta agua y moja la galleta. Después el pan: lo recogemos de la panadería de la esquina a las 4:30, todavía caliente.\n\nEl jugo va de último entre los líquidos. Exprimido a las 4:40, sellado a las 4:45, en frío hasta que sube al carro.\n\nLa tarjeta se escribe al final. Con tinta de gel, que seca rápido, y siempre a mano. Es lo primero que lee quien abre la caja.`,
  },
  {
    id: 'b2',
    slug: 'que-regalar-segun-la-ocasion',
    title: 'Qué desayuno regalar según la ocasión',
    excerpt: 'Cumpleaños, disculpa, aniversario, primer día de trabajo. Cada uno pide una caja distinta.',
    cover: img('bowl-aguacate'),
    author: 'Equipo Aurora',
    date: '2026-07-15',
    published: true,
    body: `Un aniversario pide Amanecer Romántico: fresas con crema y croissants rellenos hacen el trabajo emocional solos.\n\nUn cumpleaños de oficina pide Cesta Campestre, porque alcanza para compartir y nadie queda mirando.\n\nUna disculpa pide algo sencillo y bien escrito. Despertar Sencillo con una tarjeta larga funciona mejor que la caja más cara con dos líneas.\n\nUn primer día de trabajo pide Zen Morning. Nadie quiere entrar a una reunión con azúcar encima.`,
  },
  {
    id: 'b3',
    slug: 'la-tarjeta-importa-mas-que-la-caja',
    title: 'La tarjeta importa más que la caja',
    excerpt: 'Leemos miles de mensajes al año. Los que funcionan tienen una cosa en común: son específicos.',
    cover: img('banano-rosa'),
    author: 'Equipo Aurora',
    date: '2026-06-30',
    published: true,
    body: `«Feliz cumple, te quiero mucho» está bien. «Feliz cumple. Todavía me acuerdo del bus que perdimos en Villa de Leyva» es otra cosa.\n\nLa diferencia es la especificidad. Un detalle concreto convierte un mensaje genérico en algo que la persona guarda.\n\nTenés 300 caracteres en el configurador. Es suficiente para un recuerdo, un chiste interno o una frase que solo ustedes dos entienden. Usalos.`,
  },
];

const settings = {
  brand: {
    name: 'Aurora Desayunos',
    tagline: 'Desayunos sorpresa que llegan antes de que suene la alarma.',
    phone: '+57 300 000 0000',
    whatsapp: '573000000000',
    instagram: '@auroradesayunos',
    city: 'Bogotá',
  },
  banner: {
    active: true,
    text: 'Entregamos de 6:00 a. m. a 11:00 a. m. en Bogotá. Pedí hasta las 8:00 p. m. del día anterior.',
  },
  hero: {
    title: 'Llega antes que la alarma.',
    subtitle:
      'Se arman a las cuatro de la mañana y llegan a la puerta con la hora que vos elegís, una tarjeta escrita a mano y flores si querés.',
    ctaLabel: 'Ver los desayunos',
    image: img('cama-lilas'),
  },
  sections: {
    bestsellers: true,
    catalog: true,
    offers: true,
    blog: true,
    newsletter: true,
  },
  offers: {
    active: true,
    title: 'Ofertas de la semana',
    note: 'Precios vigentes hasta el domingo. Se aplican al agregar al carrito.',
  },
  delivery: {
    fee: 9000,
    freeFrom: 120000,
    cities: ['Bogotá', 'Chía', 'Cajicá', 'Soacha'],
    slots: ['06:00 – 07:00', '07:00 – 08:00', '08:00 – 09:00', '09:00 – 10:00', '10:00 – 11:00'],
    cutoffNote: 'Pedidos hasta las 8:00 p. m. del día anterior.',
    minLeadDays: 1,
  },
  discountFirstOrder: 10,
  newsletter: {
    title: 'Una carta los viernes',
    body: 'Escribimos una vez por semana: qué fruta está buena, qué caja nueva sale y un descuento cada tanto. Sin ruido.',
  },
};

export function buildSeed() {
  return {
    products,
    addons,
    posts,
    settings,
    orders: [],
    users: [],
    subscribers: [],
  };
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const force = process.argv.includes('--force');
  if (fs.existsSync(DB_PATH) && !force) {
    console.log('db.json ya existe. Usá --force para reescribirlo.');
  } else {
    fs.writeFileSync(DB_PATH, JSON.stringify(buildSeed(), null, 2));
    console.log('db.json escrito con', products.length, 'productos.');
  }
}
