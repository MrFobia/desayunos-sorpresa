/**
 * Genera migrations/0003_copy_colombia.sql.
 *
 * El contenido ya cargado en D1 quedó con el copy anterior en voseo
 * rioplatense; corregir `data/seed.js` sólo arregla las instalaciones nuevas.
 * Esta migración reescribe los textos de los registros que ya existen.
 *
 * Sólo toca campos de redacción —frase, descripción, nota de preparación,
 * cuerpo de las notas y ajustes del sitio—. No toca precios, fotos, estados
 * ni nada que el cliente pueda haber editado desde el panel salvo el copy.
 *
 *   node scripts/generate-copy-migration.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeed } from '../data/seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'migrations', '0003_copy_colombia.sql');

const q = (value) => `'${String(value ?? '').replace(/'/g, "''")}'`;

const seed = buildSeed();
const lines = [
  '-- GENERADO POR scripts/generate-copy-migration.mjs — no editar a mano.',
  '-- Pasa el contenido ya cargado de voseo rioplatense a español colombiano.',
  '-- El negocio es de Bogotá; «elegís / ponés / acá» sonaba importado.',
  '',
];

seed.products.forEach((p) => {
  lines.push(
    `UPDATE products SET tagline = ${q(p.tagline)}, description = ${q(p.description)}, ` +
      `prep_note = ${q(p.prepNote)}, includes = ${q(JSON.stringify(p.includes))} WHERE id = ${q(p.id)};`,
  );
});

lines.push('');
seed.posts.forEach((p) => {
  lines.push(
    `UPDATE posts SET title = ${q(p.title)}, excerpt = ${q(p.excerpt)}, body = ${q(p.body)} WHERE id = ${q(p.id)};`,
  );
});

lines.push('');
lines.push(`UPDATE settings SET value = ${q(JSON.stringify(seed.settings))} WHERE key = 'site';`);
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'));
console.log(
  `0003_copy_colombia.sql escrito: ${seed.products.length} desayunos, ${seed.posts.length} notas y los ajustes.`,
);
