const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export const money = (value) => cop.format(Number(value) || 0);

const longDate = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** Acepta 'YYYY-MM-DD' y lo formatea sin corrimiento de zona horaria. */
export function prettyDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return longDate.format(new Date(y, m - 1, d));
}

export function shortDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(y, m - 1, d),
  );
}

/** Fecha mínima de entrega: hoy + minLeadDays, en formato input[type=date]. */
export function minDeliveryDate(leadDays = 1) {
  const d = new Date();
  d.setDate(d.getDate() + leadDays);
  return d.toISOString().slice(0, 10);
}

export const CATEGORY_LABELS = {
  clasicos: 'Clásicos',
  dulces: 'Dulces',
  saludables: 'Saludables',
  romanticos: 'Románticos',
  gourmet: 'Gourmet',
  infantiles: 'Para niños',
};

export const categoryLabel = (key) => CATEGORY_LABELS[key] || key;
