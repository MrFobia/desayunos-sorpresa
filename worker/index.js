/**
 * API de Aurora Desayunos sobre Cloudflare Workers + D1.
 *
 * Reemplaza al servidor Express, que no puede correr en Workers: no hay
 * sistema de archivos para `db.json` ni memoria compartida entre instancias.
 * Las rutas y las respuestas son idénticas a las de antes, así que el front
 * no se enteró del cambio.
 *
 * El mismo Worker sirve la aplicación: `/api/*` lo atiende Hono y todo lo
 * demás cae en los assets estáticos (binding ASSETS) con reescritura de SPA.
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getProduct,
  getSettings,
  listAddons,
  listOrders,
  listPosts,
  listProducts,
  nextId,
  productToRow,
  rowToAddon,
  rowToOrder,
  rowToPost,
  rowToProduct,
  saveSettings,
  slugify,
  unitsSold,
} from './db.js';
import {
  constantTimeCompare,
  createAdminToken,
  hashPassword,
  verifyAdminToken,
  verifyPassword,
} from './auth.js';

const app = new Hono();

app.use('/api/*', cors());

const adminPassword = (env) => env.ADMIN_PASSWORD || 'aurora2026';

/**
 * Secreto de firma del token del panel. En producción se define como secret
 * de Wrangler; si falta, se deriva de la contraseña del panel para que el
 * entorno local funcione sin configurar nada extra.
 */
const sessionSecret = (env) => env.SESSION_SECRET || `dev-${adminPassword(env)}`;

/* --------------------------------------------------------- middleware --- */

async function requireAdmin(c, next) {
  const token = (c.req.header('authorization') || '').replace(/^Bearer /, '');
  const ok = await verifyAdminToken(sessionSecret(c.env), token);
  if (!ok) return c.json({ error: 'No autorizado. Iniciá sesión en el panel.' }, 401);
  return next();
}

/* ----------------------------------------------------- lectura pública --- */

app.get('/api/bootstrap', async (c) => {
  const db = c.env.DB;
  const [products, addons, posts, settings, sold] = await Promise.all([
    listProducts(db),
    listAddons(db),
    listPosts(db),
    getSettings(db),
    unitsSold(db),
  ]);

  return c.json({
    products: products.map((p) => ({ ...p, sold: sold[p.id] || 0 })),
    addons,
    posts,
    settings,
    stats: {
      products: products.length,
      slots: settings?.delivery?.slots?.length || 0,
      cities: settings?.delivery?.cities?.length || 0,
      earliest: settings?.delivery?.slots?.[0]?.split('–')[0]?.trim() || '',
      addons: addons.length,
    },
  });
});

app.get('/api/products', async (c) => {
  const all = c.req.query('all') === '1';
  return c.json(await listProducts(c.env.DB, { onlyActive: !all }));
});

app.get('/api/products/:slug', async (c) => {
  const product = await getProduct(c.env.DB, c.req.param('slug'));
  if (!product) return c.json({ error: 'Desayuno no encontrado' }, 404);
  return c.json(product);
});

app.get('/api/addons', async (c) => {
  const all = c.req.query('all') === '1';
  return c.json(await listAddons(c.env.DB, { onlyActive: !all }));
});

app.get('/api/posts', async (c) => {
  const all = c.req.query('all') === '1';
  return c.json(await listPosts(c.env.DB, { onlyPublished: !all }));
});

app.get('/api/posts/:slug', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM posts WHERE slug = ?1 OR id = ?1')
    .bind(c.req.param('slug'))
    .first();
  if (!row) return c.json({ error: 'Nota no encontrada' }, 404);
  return c.json(rowToPost(row));
});

app.get('/api/settings', async (c) => c.json(await getSettings(c.env.DB)));

/* ------------------------------------------------------------ boletín --- */

app.post('/api/subscribers', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return c.json({ error: 'Revisá el correo, no parece válido.' }, 400);
  }
  await c.env.DB.prepare(
    'INSERT INTO subscribers (email, date) VALUES (?1, ?2) ON CONFLICT (email) DO NOTHING',
  )
    .bind(email, new Date().toISOString())
    .run();
  return c.json({ ok: true });
});

/* ------------------------------------------------- cuentas de cliente --- */

app.post('/api/auth/register', async (c) => {
  const { name, email, password } = await c.req.json().catch(() => ({}));
  const mail = String(email || '').trim().toLowerCase();
  if (!name || !mail || !password || String(password).length < 6) {
    return c.json({ error: 'Nombre, correo y contraseña de 6+ caracteres.' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?1')
    .bind(mail)
    .first();
  if (existing) return c.json({ error: 'Ya existe una cuenta con ese correo.' }, 409);

  const id = await nextId(c.env.DB, 'users', 'u');
  await c.env.DB.prepare(
    'INSERT INTO users (id, name, email, password, first_order_used, created_at) VALUES (?1, ?2, ?3, ?4, 0, ?5)',
  )
    .bind(id, String(name).trim(), mail, await hashPassword(String(password)), new Date().toISOString())
    .run();

  return c.json({ user: { id, name: String(name).trim(), email: mail, firstOrderUsed: false } });
});

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({}));
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?1')
    .bind(String(email || '').trim().toLowerCase())
    .first();

  if (!user || !(await verifyPassword(String(password || ''), user.password))) {
    return c.json({ error: 'Correo o contraseña incorrectos.' }, 401);
  }

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      firstOrderUsed: Boolean(user.first_order_used),
    },
  });
});

/* ------------------------------------------------------------ pedidos --- */

function orderCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return 'AUR-' + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

app.post('/api/orders', async (c) => {
  const db = c.env.DB;
  const { items, customer, userId } = await c.req.json().catch(() => ({}));

  if (!Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'El pedido no tiene desayunos.' }, 400);
  }
  if (!customer?.name || !customer?.phone || !customer?.address) {
    return c.json({ error: 'Faltan datos de entrega.' }, 400);
  }

  const [products, addons, settings] = await Promise.all([
    listProducts(db, { onlyActive: false }),
    listAddons(db, { onlyActive: false }),
    getSettings(db),
  ]);

  // El precio se recalcula en el servidor: nunca se confía en el total del cliente.
  let subtotal = 0;
  const priced = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return c.json({ error: 'Producto inexistente: ' + item.productId }, 400);

    const addonLines = (item.addons || [])
      .map((id) => addons.find((a) => a.id === id))
      .filter(Boolean)
      .map((a) => ({ id: a.id, name: a.name, price: a.price }));

    const unit = product.price + addonLines.reduce((s, a) => s + a.price, 0);
    const qty = Math.max(1, Number(item.qty) || 1);
    subtotal += unit * qty;

    priced.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      basePrice: product.price,
      addons: addonLines,
      removed: item.removed || [],
      qty,
      lineTotal: unit * qty,
      delivery: { date: item.delivery?.date || '', slot: item.delivery?.slot || '' },
      recipient: item.recipient || {},
      message: String(item.message || '').slice(0, 300),
    });
  }

  const user = userId
    ? await db.prepare('SELECT * FROM users WHERE id = ?1').bind(userId).first()
    : null;

  const eligible = user && !user.first_order_used;
  const discount = eligible ? Math.round(subtotal * ((settings.discountFirstOrder || 0) / 100)) : 0;
  const deliveryFee =
    subtotal - discount >= settings.delivery.freeFrom ? 0 : settings.delivery.fee;
  const total = subtotal - discount + deliveryFee;

  const id = await nextId(db, 'orders', 'o');
  const order = {
    id,
    code: orderCode(),
    createdAt: new Date().toISOString(),
    items: priced,
    customer: {
      name: String(customer.name).trim(),
      phone: String(customer.phone).trim(),
      email: String(customer.email || '').trim().toLowerCase(),
      address: String(customer.address).trim(),
      city: customer.city || settings.delivery.cities[0],
      notes: String(customer.notes || '').slice(0, 400),
    },
    userId: user?.id || null,
    guest: !user,
    subtotal,
    discount,
    discountLabel: discount ? `Primer pedido −${settings.discountFirstOrder} %` : null,
    deliveryFee,
    total,
    status: 'recibido',
  };

  const statements = [
    db
      .prepare(
        'INSERT INTO orders (id, code, created_at, items, customer, user_id, guest, subtotal, discount, discount_label, delivery_fee, total, status) ' +
          'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)',
      )
      .bind(
        order.id,
        order.code,
        order.createdAt,
        JSON.stringify(order.items),
        JSON.stringify(order.customer),
        order.userId,
        order.guest ? 1 : 0,
        order.subtotal,
        order.discount,
        order.discountLabel,
        order.deliveryFee,
        order.total,
        order.status,
      ),
  ];

  if (eligible) {
    statements.push(
      db.prepare('UPDATE users SET first_order_used = 1 WHERE id = ?1').bind(user.id),
    );
  }

  // El pedido y el consumo del descuento van juntos o no van.
  await db.batch(statements);

  return c.json(order);
});

app.get('/api/orders/:code', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM orders WHERE code = ?1')
    .bind(c.req.param('code').toUpperCase())
    .first();
  if (!row) return c.json({ error: 'No encontramos ese pedido.' }, 404);
  return c.json(rowToOrder(row));
});

/* -------------------------------------------------------------- panel --- */

app.post('/api/admin/login', async (c) => {
  const { password } = await c.req.json().catch(() => ({}));
  if (!constantTimeCompare(password || '', adminPassword(c.env))) {
    return c.json({ error: 'Contraseña incorrecta.' }, 401);
  }
  return c.json({ token: await createAdminToken(sessionSecret(c.env)) });
});

app.get('/api/admin/summary', requireAdmin, async (c) => {
  const db = c.env.DB;
  const [products, orders, subscribers, users] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS total, SUM(active) AS actives FROM products').first(),
    db.prepare('SELECT COUNT(*) AS total, SUM(total) AS revenue FROM orders').first(),
    db.prepare('SELECT COUNT(*) AS total FROM subscribers').first(),
    db.prepare('SELECT COUNT(*) AS total FROM users').first(),
  ]);
  const pending = await db
    .prepare("SELECT COUNT(*) AS total FROM orders WHERE status NOT IN ('entregado', 'cancelado')")
    .first();

  return c.json({
    products: products.total,
    activeProducts: products.actives || 0,
    orders: orders.total,
    pending: pending.total,
    revenue: orders.revenue || 0,
    subscribers: subscribers.total,
    users: users.total,
  });
});

app.get('/api/admin/products', requireAdmin, async (c) =>
  c.json(await listProducts(c.env.DB, { onlyActive: false })),
);
app.get('/api/admin/addons', requireAdmin, async (c) =>
  c.json(await listAddons(c.env.DB, { onlyActive: false })),
);
app.get('/api/admin/posts', requireAdmin, async (c) =>
  c.json(await listPosts(c.env.DB, { onlyPublished: false })),
);
app.get('/api/admin/orders', requireAdmin, async (c) => c.json(await listOrders(c.env.DB)));
app.get('/api/admin/subscribers', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM subscribers ORDER BY date DESC').all();
  return c.json(results);
});

/** Lista de imágenes disponibles, leída del manifiesto generado en el build. */
app.get('/api/admin/media', requireAdmin, async (c) => {
  const res = await c.env.ASSETS.fetch(new URL('/media.json', c.req.url));
  if (!res.ok) return c.json([]);
  return c.json(await res.json());
});

/* --- productos --- */

app.post('/api/admin/products', requireAdmin, async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const id = await nextId(db, 'products', 'p');
  const row = productToRow({ ...body, slug: slugify(body.slug || body.name || 'desayuno') });

  await db
    .prepare(
      'INSERT INTO products (id, slug, name, price, compare_at, category, tagline, description, serves, prep_note, images, includes, badges, reviews, featured, active) ' +
        'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)',
    )
    .bind(
      id,
      row.slug,
      row.name,
      row.price,
      row.compare_at,
      row.category,
      row.tagline,
      row.description,
      row.serves,
      row.prep_note,
      row.images,
      row.includes,
      row.badges,
      row.reviews,
      row.featured,
      row.active,
    )
    .run();

  return c.json(await getProduct(db, id));
});

app.put('/api/admin/products/:id', requireAdmin, async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const current = await db.prepare('SELECT * FROM products WHERE id = ?1').bind(id).first();
  if (!current) return c.json({ error: 'No existe' }, 404);

  // Fusión con lo que ya está: el panel manda cambios parciales (un toggle).
  const merged = { ...rowToProduct(current), ...(await c.req.json()) };
  const row = productToRow({ ...merged, slug: slugify(merged.slug || merged.name) });

  await db
    .prepare(
      'UPDATE products SET slug = ?2, name = ?3, price = ?4, compare_at = ?5, category = ?6, tagline = ?7, ' +
        'description = ?8, serves = ?9, prep_note = ?10, images = ?11, includes = ?12, badges = ?13, ' +
        'reviews = ?14, featured = ?15, active = ?16 WHERE id = ?1',
    )
    .bind(
      id,
      row.slug,
      row.name,
      row.price,
      row.compare_at,
      row.category,
      row.tagline,
      row.description,
      row.serves,
      row.prep_note,
      row.images,
      row.includes,
      row.badges,
      row.reviews,
      row.featured,
      row.active,
    )
    .run();

  return c.json(await getProduct(db, id));
});

app.delete('/api/admin/products/:id', requireAdmin, async (c) => {
  const info = await c.env.DB.prepare('DELETE FROM products WHERE id = ?1')
    .bind(c.req.param('id'))
    .run();
  if (!info.meta.changes) return c.json({ error: 'No existe' }, 404);
  return c.json({ ok: true });
});

/* --- adicionales --- */

app.post('/api/admin/addons', requireAdmin, async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const id = await nextId(db, 'addons', 'a');
  await db
    .prepare('INSERT INTO addons (id, name, price, category, image, active) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(
      id,
      body.name || '',
      Number(body.price) || 0,
      body.category || 'comida',
      body.image || '',
      body.active === false ? 0 : 1,
    )
    .run();
  const row = await db.prepare('SELECT * FROM addons WHERE id = ?1').bind(id).first();
  return c.json(rowToAddon(row));
});

app.put('/api/admin/addons/:id', requireAdmin, async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const current = await db.prepare('SELECT * FROM addons WHERE id = ?1').bind(id).first();
  if (!current) return c.json({ error: 'No existe' }, 404);

  const merged = { ...rowToAddon(current), ...(await c.req.json()) };
  await db
    .prepare('UPDATE addons SET name = ?2, price = ?3, category = ?4, image = ?5, active = ?6 WHERE id = ?1')
    .bind(
      id,
      merged.name,
      Number(merged.price) || 0,
      merged.category,
      merged.image || '',
      merged.active === false ? 0 : 1,
    )
    .run();

  const row = await db.prepare('SELECT * FROM addons WHERE id = ?1').bind(id).first();
  return c.json(rowToAddon(row));
});

app.delete('/api/admin/addons/:id', requireAdmin, async (c) => {
  const info = await c.env.DB.prepare('DELETE FROM addons WHERE id = ?1')
    .bind(c.req.param('id'))
    .run();
  if (!info.meta.changes) return c.json({ error: 'No existe' }, 404);
  return c.json({ ok: true });
});

/* --- notas --- */

app.post('/api/admin/posts', requireAdmin, async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const id = await nextId(db, 'posts', 'b');
  await db
    .prepare(
      'INSERT INTO posts (id, slug, title, excerpt, cover, author, date, body, published) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)',
    )
    .bind(
      id,
      slugify(body.slug || body.title || 'nota'),
      body.title || '',
      body.excerpt || '',
      body.cover || '',
      body.author || '',
      body.date || new Date().toISOString().slice(0, 10),
      body.body || '',
      body.published === false ? 0 : 1,
    )
    .run();
  const row = await db.prepare('SELECT * FROM posts WHERE id = ?1').bind(id).first();
  return c.json(rowToPost(row));
});

app.put('/api/admin/posts/:id', requireAdmin, async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');
  const current = await db.prepare('SELECT * FROM posts WHERE id = ?1').bind(id).first();
  if (!current) return c.json({ error: 'No existe' }, 404);

  const merged = { ...rowToPost(current), ...(await c.req.json()) };
  await db
    .prepare(
      'UPDATE posts SET slug = ?2, title = ?3, excerpt = ?4, cover = ?5, author = ?6, date = ?7, body = ?8, published = ?9 WHERE id = ?1',
    )
    .bind(
      id,
      slugify(merged.slug || merged.title),
      merged.title,
      merged.excerpt || '',
      merged.cover || '',
      merged.author || '',
      merged.date,
      merged.body || '',
      merged.published === false ? 0 : 1,
    )
    .run();

  const row = await db.prepare('SELECT * FROM posts WHERE id = ?1').bind(id).first();
  return c.json(rowToPost(row));
});

app.delete('/api/admin/posts/:id', requireAdmin, async (c) => {
  const info = await c.env.DB.prepare('DELETE FROM posts WHERE id = ?1')
    .bind(c.req.param('id'))
    .run();
  if (!info.meta.changes) return c.json({ error: 'No existe' }, 404);
  return c.json({ ok: true });
});

/* --- pedidos y ajustes --- */

app.put('/api/admin/orders/:id', requireAdmin, async (c) => {
  const db = c.env.DB;
  const { status } = await c.req.json().catch(() => ({}));
  if (status) {
    await db.prepare('UPDATE orders SET status = ?2 WHERE id = ?1').bind(c.req.param('id'), status).run();
  }
  const row = await db.prepare('SELECT * FROM orders WHERE id = ?1').bind(c.req.param('id')).first();
  if (!row) return c.json({ error: 'No existe' }, 404);
  return c.json(rowToOrder(row));
});

app.put('/api/admin/settings', requireAdmin, async (c) => {
  const current = (await getSettings(c.env.DB)) || {};
  const next = { ...current, ...(await c.req.json()) };
  return c.json(await saveSettings(c.env.DB, next));
});

/* ------------------------------------------------------------ errores --- */

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || 'Error del servidor' }, 500);
});

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Ruta no encontrada' }, 404);
  // Todo lo que no es API lo resuelven los assets (SPA).
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
