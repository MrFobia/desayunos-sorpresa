/**
 * Autenticación para Workers.
 *
 * Dos cosas del servidor Express no sobreviven aquí:
 *
 *  1. `crypto.scryptSync` no existe en Workers. Se usa PBKDF2-SHA256 vía
 *     WebCrypto, que sí está disponible y es un derivador aceptado.
 *  2. El `Set` de tokens en memoria no sirve: cada request puede caer en una
 *     instancia distinta y la memoria no se comparte. El token del panel pasa
 *     a ser un valor firmado con HMAC que lleva su propio vencimiento, así
 *     que se verifica sin guardar nada.
 */

const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 100_000;

const toHex = (buffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

const fromHex = (hex) =>
  new Uint8Array((hex.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)));

/** Comparación en tiempo constante: no filtra dónde dejan de coincidir. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256,
  );
  return new Uint8Array(bits);
}

/** Devuelve `pbkdf2$<iteraciones>$<salt>$<hash>`. */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(derived)}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, iterations, saltHex, hashHex] = String(stored || '').split('$');
  if (scheme !== 'pbkdf2' || !saltHex || !hashHex) return false;
  const derived = await pbkdf2(password, fromHex(saltHex), Number(iterations) || PBKDF2_ITERATIONS);
  return timingSafeEqual(derived, fromHex(hashHex));
}

/* ------------------------------------------------------ token del panel --- */

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

const b64url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * Token con vencimiento propio: `<expiración>.<firma>`. No se guarda en
 * ningún lado; se verifica recalculando la firma.
 */
export async function createAdminToken(secret, ttlSeconds = 60 * 60 * 8) {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(String(expiresAt)));
  return `${expiresAt}.${b64url(new Uint8Array(signature))}`;
}

export async function verifyAdminToken(secret, token) {
  const [expiresAt, signature] = String(token || '').split('.');
  if (!expiresAt || !signature) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

  const key = await hmacKey(secret);
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(expiresAt));
  return b64url(new Uint8Array(expected)) === signature;
}

/** Comparación de la contraseña del panel sin filtrar longitud por tiempo. */
export function constantTimeCompare(a, b) {
  return timingSafeEqual(encoder.encode(String(a)), encoder.encode(String(b)));
}
