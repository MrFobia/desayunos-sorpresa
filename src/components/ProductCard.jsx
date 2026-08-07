import { Link } from 'react-router-dom';
import { money, categoryLabel } from '../lib/format.js';

/**
 * Ficha densa: foto, etiquetas de estado, precio con tachado, y dos datos
 * verificables (cuántas cosas trae, para cuántos alcanza). Sin estrellas
 * inventadas: la valoración aparece sólo si el producto tiene reseñas reales
 * cargadas desde el panel.
 *
 * `size="lead"` agranda la pieza principal de una fila para que la grilla
 * tenga jerarquía en vez de ocho tarjetas idénticas.
 */
export default function ProductCard({ product, size = 'base', priority = false }) {
  const discounted = product.compareAt && product.compareAt > product.price;
  const off = discounted ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const lead = size === 'lead';
  const reviews = product.reviews || [];
  const rating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <article className="tile group flex h-full flex-col transition-shadow duration-200 hover:shadow-[var(--shadow-hard)]">
      <Link to={`/desayunos/${product.slug}`} className="flex min-h-0 flex-1 flex-col">
        <div
          className={`relative overflow-hidden ${lead ? 'aspect-4/3' : 'aspect-5/4'}`}
          style={{ background: 'var(--color-paper-3)' }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            width="640"
            height="512"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />

          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {discounted && <span className="chip chip-solid nums">−{off} %</span>}
            {product.badges?.map((badge) => (
              <span
                key={badge}
                className={`chip ${badge === 'Sin azúcar añadida' ? 'chip-leaf' : 'chip-ink'}`}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className={`flex flex-1 flex-col ${lead ? 'p-4 md:p-5' : 'p-3.5'}`}>
          <div className="flex items-start justify-between gap-2">
            <h3 className={`leading-tight ${lead ? 'text-xl' : 'text-base sm:text-lg'}`}>
              {product.name}
            </h3>
            {rating && (
              <span className="chip nums" title={`${reviews.length} reseñas`}>
                ★ {rating}
              </span>
            )}
          </div>

          <p className={`mt-1 text-muted ${lead ? 'text-base' : 'text-sm'}`}>{product.tagline}</p>

          <p className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="chip">{categoryLabel(product.category)}</span>
            <span className="chip">{product.includes.length} cosas</span>
            <span className="chip">{product.serves === 1 ? '1 persona' : `${product.serves} personas`}</span>
          </p>

          {/* Precio arriba y acción debajo: en una columna angosta el precio
              grande y el botón no caben en la misma línea sin recortarse. */}
          <div className="mt-auto pt-3.5">
            <p className="nums flex flex-wrap items-baseline gap-x-1.5 leading-none">
              {discounted && (
                <span className="text-sm text-neutral line-through">{money(product.compareAt)}</span>
              )}
              <span
                className={lead ? 'font-display text-2xl' : 'font-display text-xl'}
                style={{ color: discounted ? 'var(--color-accent)' : 'inherit' }}
              >
                {money(product.price)}
              </span>
            </p>
            <span className="btn btn-primary mt-2.5 w-full py-2 text-xs">Armar caja</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
