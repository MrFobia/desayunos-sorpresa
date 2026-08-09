/**
 * Genera migrations/0002_seed.sql a partir de data/seed.js.
 *
 * La transcripción del cuaderno del cliente vive en un solo lugar: seed.js.
 * Este script la vuelca a SQL para que D1 arranque con los mismos ocho
 * desayunos, sin copiar los datos a mano a un segundo archivo que después
 * se desincroniza.
 *
 *   npm run db:generate
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeed } from '../data/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'migrations', '0002_seed.sql');

const q = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replace(/'/g, "''")}'`;
};

const json = (value) => q(JSON.stringify(value ?? []));

const seed = buildSeed();
const lines = [
  '-- GENERADO POR scripts/generate-seed-sql.mjs — no editar a mano.',
  '-- Fuente de verdad: server/seed.js (transcripción del cuaderno del cliente).',
  '-- Regenerar con: npm run db:generate',
  '',
];

seed.products.forEach((p, i) => {
  lines.push(
    'INSERT OR IGNORE INTO products (id, slug, name, price, compare_at, category, tagline, description, serves, prep_note, images, includes, badges, reviews, featured, active, position) VALUES (' +
      [
        q(p.id),
        q(p.slug),
        q(p.name),
        q(p.price),
        q(p.compareAt ?? null),
        q(p.category),
        q(p.tagline),
        q(p.description),
        q(p.serves),
        q(p.prepNote),
        json(p.images),
        json(p.includes),
        json(p.badges),
        json(p.reviews),
        q(Boolean(p.featured)),
        q(p.active !== false),
        q(i),
      ].join(', ') +
      ');',
  );
});

lines.push('');
seed.addons.forEach((a) => {
  lines.push(
    'INSERT OR IGNORE INTO addons (id, name, price, category, image, active) VALUES (' +
      [q(a.id), q(a.name), q(a.price), q(a.category), q(a.image), q(a.active !== false)].join(', ') +
      ');',
  );
});

lines.push('');
seed.posts.forEach((p) => {
  lines.push(
    'INSERT OR IGNORE INTO posts (id, slug, title, excerpt, cover, author, date, body, published) VALUES (' +
      [
        q(p.id),
        q(p.slug),
        q(p.title),
        q(p.excerpt),
        q(p.cover),
        q(p.author),
        q(p.date),
        q(p.body),
        q(p.published !== false),
      ].join(', ') +
      ');',
  );
});

lines.push('');
lines.push(
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('site', ${q(JSON.stringify(seed.settings))});`,
);
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'));
console.log(
  `0002_seed.sql escrito: ${seed.products.length} desayunos, ${seed.addons.length} adicionales, ${seed.posts.length} notas.`,
);
