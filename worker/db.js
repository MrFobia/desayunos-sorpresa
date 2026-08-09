/**
 * Acceso a D1. Traduce entre las filas de SQLite —donde los arreglos viven
 * como texto JSON y los booleanos como 0/1— y la forma que el front ya
 * consume, que no cambió al migrar desde el archivo JSON.
 */

const parse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/* --------------------------------------------------------- productos --- */

export function rowToProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    compareAt: row.compare_at,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    serves: row.serves,
    prepNote: row.prep_note,
    images: parse(row.images, []),
    includes: parse(row.includes, []),
    badges: parse(row.badges, []),
    reviews: parse(row.reviews, []),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
  };
}

export function productToRow(product) {
  return {
    slug: product.slug,
    name: product.name,
    price: Number(product.price) || 0,
    compare_at:
      product.compareAt === '' || product.compareAt === null || product.compareAt === undefined
        ? null
        : Number(product.compareAt),
    category: product.category || 'clasicos',
    tagline: product.tagline || '',
    description: product.description || '',
    serves: Number(product.serves) || 1,
    prep_note: product.prepNote || '',
    images: JSON.stringify((product.images || []).filter(Boolean)),
    includes: JSON.stringify((product.includes || []).filter((i) => i && i.name)),
    badges: JSON.stringify((product.badges || []).filter(Boolean)),
    reviews: JSON.stringify((product.reviews || []).filter((r) => r && r.text && r.name)),
    featured: product.featured ? 1 : 0,
    active: product.active === false ? 0 : 1,
  };
}

export async function listProducts(db, { onlyActive = true } = {}) {
  const sql = onlyActive
    ? 'SELECT * FROM products WHERE active = 1 ORDER BY position, price'
    : 'SELECT * FROM products ORDER BY position, price';
  const { results } = await db.prepare(sql).all();
  return results.map(rowToProduct);
}

export async function getProduct(db, slugOrId) {
  const row = await db
    .prepare('SELECT * FROM products WHERE slug = ?1 OR id = ?1')
    .bind(slugOrId)
    .first();
  return row ? rowToProduct(row) : null;
}

/* ---------------------------------------------------------- extras ---- */

export function rowToAddon(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    image: row.image,
    active: Boolean(row.active),
  };
}

export async function listAddons(db, { onlyActive = true } = {}) {
  const sql = onlyActive
    ? 'SELECT * FROM addons WHERE active = 1 ORDER BY category, price'
    : 'SELECT * FROM addons ORDER BY category, price';
  const { results } = await db.prepare(sql).all();
  return results.map(rowToAddon);
}

/* ------------------------------------------------------------ notas --- */

export function rowToPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: row.cover,
    author: row.author,
    date: row.date,
    body: row.body,
    published: Boolean(row.published),
  };
}

export async function listPosts(db, { onlyPublished = true } = {}) {
  const sql = onlyPublished
    ? 'SELECT * FROM posts WHERE published = 1 ORDER BY date DESC'
    : 'SELECT * FROM posts ORDER BY date DESC';
  const { results } = await db.prepare(sql).all();
  return results.map(rowToPost);
}

/* --------------------------------------------------------- pedidos --- */

export function rowToOrder(row) {
  return {
    id: row.id,
    code: row.code,
    createdAt: row.created_at,
    items: parse(row.items, []),
    customer: parse(row.customer, {}),
    userId: row.user_id,
    guest: Boolean(row.guest),
    subtotal: row.subtotal,
    discount: row.discount,
    discountLabel: row.discount_label,
    deliveryFee: row.delivery_fee,
    total: row.total,
    status: row.status,
  };
}

export async function listOrders(db) {
  const { results } = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return results.map(rowToOrder);
}

/**
 * Unidades vendidas por producto, sobre los pedidos no cancelados.
 * SQLite no tiene funciones de JSON agregadas cómodas para esto, así que se
 * recorren las líneas en JS: el volumen de un negocio de desayunos lo permite
 * de sobra y evita duplicar el modelo en una tabla de líneas.
 */
export async function unitsSold(db) {
  const { results } = await db
    .prepare("SELECT items FROM orders WHERE status != 'cancelado'")
    .all();
  const tally = {};
  results.forEach((row) => {
    parse(row.items, []).forEach((item) => {
      tally[item.productId] = (tally[item.productId] || 0) + (Number(item.qty) || 0);
    });
  });
  return tally;
}

/* --------------------------------------------------------- ajustes --- */

export async function getSettings(db) {
  const row = await db.prepare("SELECT value FROM settings WHERE key = 'site'").first();
  return parse(row?.value, null);
}

export async function saveSettings(db, settings) {
  await db
    .prepare(
      "INSERT INTO settings (key, value) VALUES ('site', ?1) " +
        'ON CONFLICT (key) DO UPDATE SET value = excluded.value',
    )
    .bind(JSON.stringify(settings))
    .run();
  return settings;
}

/* ------------------------------------------------------------ ids ---- */

/** Siguiente id con prefijo (p1, p2, …) mirando el máximo actual. */
export async function nextId(db, table, prefix) {
  const { results } = await db.prepare(`SELECT id FROM ${table}`).all();
  const max = results.reduce((acc, row) => {
    const n = Number(String(row.id).replace(/\D/g, ''));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}${max + 1}`;
}

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
