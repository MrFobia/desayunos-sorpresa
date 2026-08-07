/**
 * API de Aurora Desayunos.
 *
 * Persistencia: server/db.json (un archivo, escritura sincrónica).
 * Suficiente para un prototipo de una sola máquina; no para producción.
 *
 * AVISO DE SEGURIDAD — esto es un prototipo:
 *  - El panel de administración se protege con una sola contraseña (ADMIN_PASSWORD)
 *    y un token en memoria que se pierde al reiniciar el proceso.
 *  - No hay rate limiting, ni HTTPS, ni rotación de tokens.
 *  Antes de exponerlo a internet hay que reemplazar esta capa por autenticación real.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { buildSeed, DB_PATH } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.API_PORT || 5174;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'aurora2026';

/* ---------------------------------------------------------------- db --- */

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(buildSeed(), null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function nextId(collection, prefix) {
  const n = collection.reduce((max, item) => {
    const num = Number(String(item.id).replace(/\D/g, ''));
    return Number.isFinite(num) && num > max ? num : max;
  }, 0);
  return `${prefix}${n + 1}`;
}

function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* -------------------------------------------------------------- auth --- */

const adminTokens = new Set();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, derived] = String(stored).split(':');
  if (!salt || !derived) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(derived, 'hex'));
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!adminTokens.has(token)) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión en el panel.' });
  }
  next();
}

/* --------------------------------------------------------------- app --- */

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

/* --- lectura pública --- */

app.get('/api/bootstrap', (req, res) => {
  const db = readDb();
  res.json({
    products: db.products.filter((p) => p.active),
    addons: db.addons.filter((a) => a.active),
    posts: db.posts.filter((p) => p.published),
    settings: db.settings,
  });
});

app.get('/api/products', (req, res) => {
  const db = readDb();
  res.json(req.query.all === '1' ? db.products : db.products.filter((p) => p.active));
});

app.get('/api/products/:slug', (req, res) => {
  const db = readDb();
  const product = db.products.find((p) => p.slug === req.params.slug || p.id === req.params.slug);
  if (!product) return res.status(404).json({ error: 'Desayuno no encontrado' });
  res.json(product);
});

app.get('/api/addons', (req, res) => {
  const db = readDb();
  res.json(req.query.all === '1' ? db.addons : db.addons.filter((a) => a.active));
});

app.get('/api/posts', (req, res) => {
  const db = readDb();
  res.json(req.query.all === '1' ? db.posts : db.posts.filter((p) => p.published));
});

app.get('/api/posts/:slug', (req, res) => {
  const db = readDb();
  const post = db.posts.find((p) => p.slug === req.params.slug || p.id === req.params.slug);
  if (!post) return res.status(404).json({ error: 'Nota no encontrada' });
  res.json(post);
});

app.get('/api/settings', (req, res) => res.json(readDb().settings));

/* --- newsletter --- */

app.post('/api/subscribers', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Revisá el correo, no parece válido.' });
  }
  const db = readDb();
  if (!db.subscribers.some((s) => s.email === email)) {
    db.subscribers.push({ email, date: new Date().toISOString() });
    writeDb(db);
  }
  res.json({ ok: true });
});

/* --- cuentas de cliente (opcionales: dan 10 % en el primer pedido) --- */

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  const mail = String(email || '').trim().toLowerCase();
  if (!name || !mail || !password || String(password).length < 6) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña de 6+ caracteres.' });
  }
  const db = readDb();
  if (db.users.some((u) => u.email === mail)) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
  }
  const user = {
    id: nextId(db.users, 'u'),
    name: String(name).trim(),
    email: mail,
    password: hashPassword(String(password)),
    firstOrderUsed: false,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  res.json({ user: { id: user.id, name: user.name, email: user.email, firstOrderUsed: false } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const db = readDb();
  const user = db.users.find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!user || !verifyPassword(String(password || ''), user.password)) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }
  res.json({
    user: { id: user.id, name: user.name, email: user.email, firstOrderUsed: user.firstOrderUsed },
  });
});

/* --- pedidos --- */

function orderCode() {
  return 'AUR-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

app.post('/api/orders', (req, res) => {
  const { items, customer, userId } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido no tiene desayunos.' });
  }
  if (!customer?.name || !customer?.phone || !customer?.address) {
    return res.status(400).json({ error: 'Faltan datos de entrega.' });
  }

  const db = readDb();
  const settings = db.settings;

  // El precio se recalcula en el servidor: nunca se confía en el total del cliente.
  let subtotal = 0;
  const priced = items.map((item) => {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) throw new Error('Producto inexistente: ' + item.productId);
    const addonLines = (item.addons || [])
      .map((id) => db.addons.find((a) => a.id === id))
      .filter(Boolean)
      .map((a) => ({ id: a.id, name: a.name, price: a.price }));
    const unit = product.price + addonLines.reduce((s, a) => s + a.price, 0);
    const qty = Math.max(1, Number(item.qty) || 1);
    subtotal += unit * qty;
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      basePrice: product.price,
      addons: addonLines,
      removed: item.removed || [],
      qty,
      lineTotal: unit * qty,
      delivery: {
        date: item.delivery?.date || '',
        slot: item.delivery?.slot || '',
      },
      recipient: item.recipient || {},
      message: String(item.message || '').slice(0, 300),
    };
  });

  const user = userId ? db.users.find((u) => u.id === userId) : null;
  const discountRate = user && !user.firstOrderUsed ? settings.discountFirstOrder / 100 : 0;
  const discount = Math.round(subtotal * discountRate);
  const deliveryFee = subtotal - discount >= settings.delivery.freeFrom ? 0 : settings.delivery.fee;
  const total = subtotal - discount + deliveryFee;

  const order = {
    id: nextId(db.orders, 'o'),
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

  if (user) {
    user.firstOrderUsed = true;
  }
  db.orders.unshift(order);
  writeDb(db);
  res.json(order);
});

app.get('/api/orders/:code', (req, res) => {
  const db = readDb();
  const order = db.orders.find((o) => o.code === req.params.code.toUpperCase());
  if (!order) return res.status(404).json({ error: 'No encontramos ese pedido.' });
  res.json(order);
});

/* ------------------------------------------------------------- admin --- */

app.post('/api/admin/login', (req, res) => {
  if (String(req.body?.password || '') !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }
  const token = crypto.randomBytes(24).toString('hex');
  adminTokens.add(token);
  res.json({ token });
});

app.get('/api/admin/summary', requireAdmin, (req, res) => {
  const db = readDb();
  const revenue = db.orders.reduce((s, o) => s + o.total, 0);
  res.json({
    products: db.products.length,
    activeProducts: db.products.filter((p) => p.active).length,
    orders: db.orders.length,
    pending: db.orders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado').length,
    revenue,
    subscribers: db.subscribers.length,
    users: db.users.length,
  });
});

/** CRUD genérico para las colecciones editables desde el panel. */
function crud(collection, prefix, normalize = (x) => x) {
  app.get(`/api/admin/${collection}`, requireAdmin, (req, res) => {
    res.json(readDb()[collection]);
  });

  app.post(`/api/admin/${collection}`, requireAdmin, (req, res) => {
    const db = readDb();
    const item = normalize({ ...req.body, id: nextId(db[collection], prefix) }, db);
    db[collection].push(item);
    writeDb(db);
    res.json(item);
  });

  app.put(`/api/admin/${collection}/:id`, requireAdmin, (req, res) => {
    const db = readDb();
    const index = db[collection].findIndex((x) => x.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'No existe' });
    db[collection][index] = normalize({ ...db[collection][index], ...req.body, id: req.params.id }, db);
    writeDb(db);
    res.json(db[collection][index]);
  });

  app.delete(`/api/admin/${collection}/:id`, requireAdmin, (req, res) => {
    const db = readDb();
    const before = db[collection].length;
    db[collection] = db[collection].filter((x) => x.id !== req.params.id);
    if (db[collection].length === before) return res.status(404).json({ error: 'No existe' });
    writeDb(db);
    res.json({ ok: true });
  });
}

crud('products', 'p', (product) => ({
  ...product,
  slug: product.slug ? slugify(product.slug) : slugify(product.name || 'desayuno'),
  price: Number(product.price) || 0,
  compareAt: product.compareAt ? Number(product.compareAt) : null,
  serves: Number(product.serves) || 1,
  images: (product.images || []).filter(Boolean),
  includes: (product.includes || []).filter((i) => i && i.name),
  badges: (product.badges || []).filter(Boolean),
  active: product.active !== false,
  featured: Boolean(product.featured),
}));

crud('addons', 'a', (addon) => ({
  ...addon,
  price: Number(addon.price) || 0,
  active: addon.active !== false,
}));

crud('posts', 'b', (post) => ({
  ...post,
  slug: post.slug ? slugify(post.slug) : slugify(post.title || 'nota'),
  date: post.date || new Date().toISOString().slice(0, 10),
  published: post.published !== false,
}));

app.get('/api/admin/orders', requireAdmin, (req, res) => res.json(readDb().orders));

app.put('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const db = readDb();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'No existe' });
  if (req.body.status) order.status = req.body.status;
  writeDb(db);
  res.json(order);
});

app.get('/api/admin/subscribers', requireAdmin, (req, res) => res.json(readDb().subscribers));

/** Imágenes disponibles en public/img, para el selector del panel. */
app.get('/api/admin/media', requireAdmin, (req, res) => {
  const dir = path.join(__dirname, '..', 'public', 'img');
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f) && !f.includes('-sm.'))
    .sort();
  res.json(files.map((f) => `/img/${f}`));
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error del servidor' });
});

app.listen(PORT, () => {
  console.log(`API de Aurora escuchando en http://localhost:${PORT}`);
});
