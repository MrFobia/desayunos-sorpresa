/**
 * Escribe public/media.json con las fotos disponibles.
 *
 * El selector de imágenes del panel antes leía `public/img` con `fs`. En
 * Workers no hay disco, así que la lista se congela en el build y el Worker
 * la sirve como un asset más.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, '..', 'public', 'img');
const OUT = path.join(__dirname, '..', 'public', 'media.json');

const files = fs.existsSync(IMG_DIR)
  ? fs
      .readdirSync(IMG_DIR)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f) && !f.includes('-sm.'))
      .sort()
      .map((f) => `/img/${f}`)
  : [];

fs.writeFileSync(OUT, JSON.stringify(files, null, 2));
console.log(`media.json: ${files.length} imágenes.`);
