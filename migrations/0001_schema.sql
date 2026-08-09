-- Esquema de Aurora Desayunos en D1 (SQLite).
--
-- Criterio de normalización: se normaliza lo que se consulta o se filtra
-- (precio, categoría, estado, correo) y se guardan como JSON los arreglos que
-- siempre se leen completos junto al registro padre —fotos, qué trae la caja,
-- etiquetas, reseñas, líneas del pedido—. Partirlos en tablas obligaría a
-- media docena de consultas por pantalla sin ganar nada: nadie busca «cajas
-- que traigan kiwi».

CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL,
  compare_at  INTEGER,
  category    TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  serves      INTEGER NOT NULL DEFAULT 1,
  prep_note   TEXT NOT NULL DEFAULT '',
  images      TEXT NOT NULL DEFAULT '[]',
  includes    TEXT NOT NULL DEFAULT '[]',
  badges      TEXT NOT NULL DEFAULT '[]',
  reviews     TEXT NOT NULL DEFAULT '[]',
  featured    INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

CREATE TABLE IF NOT EXISTS addons (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  price    INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'comida',
  image    TEXT NOT NULL DEFAULT '',
  active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS posts (
  id        TEXT PRIMARY KEY,
  slug      TEXT NOT NULL UNIQUE,
  title     TEXT NOT NULL,
  excerpt   TEXT NOT NULL DEFAULT '',
  cover     TEXT NOT NULL DEFAULT '',
  author    TEXT NOT NULL DEFAULT '',
  date      TEXT NOT NULL,
  body      TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  password         TEXT NOT NULL,
  first_order_used INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  code           TEXT NOT NULL UNIQUE,
  created_at     TEXT NOT NULL,
  items          TEXT NOT NULL DEFAULT '[]',
  customer       TEXT NOT NULL DEFAULT '{}',
  user_id        TEXT,
  guest          INTEGER NOT NULL DEFAULT 1,
  subtotal       INTEGER NOT NULL DEFAULT 0,
  discount       INTEGER NOT NULL DEFAULT 0,
  discount_label TEXT,
  delivery_fee   INTEGER NOT NULL DEFAULT 0,
  total          INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'recibido',
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  date  TEXT NOT NULL
);

-- Ajustes del sitio: una sola fila con el objeto completo. Cambia entero
-- desde el panel y siempre se lee entero.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
