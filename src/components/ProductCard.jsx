import { Link } from 'react-router-dom';
import { money, categoryLabel } from '../lib/format.js';

/**
 * Ficha editorial: la fotografía ocupa casi todo y el texto va debajo, sin
 * caja ni contorno. La versión anterior encerraba cada producto en un marco
 * con borde y sombra dura, que es lo que hacía ver el sitio como caricatura.
 *
 * `size="lead"` da un recorte más alto a la pieza principal de una fila.
 */
export default function ProductCard({ product, size = 'base', priority = false }) {
  const discounted = product.compareAt && product.compareAt > product.price;
  const off = discounted ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const reviews = product.reviews || [];
  const rating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <article className="group">
      <Link to={`/desayunos/${product.slug}`} className="block">
        <div className={`shot shot-zoom ${size === 'lead' ? 'aspect-4/5' : 'aspect-3/4'}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            width="700"
            height="933"
          />
          {(discounted || product.badges?.length > 0) && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {discounted && <span className="tag tag-accent nums">−{off} %</span>}
              {product.badges?.slice(0, 1).map((badge) => (
                <span key={badge} className="tag">
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <p className="label">{categoryLabel(product.category)}</p>

          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <h3 className={size === 'lead' ? 'text-2xl' : 'text-lg sm:text-xl'}>{product.name}</h3>
            <p className="nums shrink-0 text-right">
              {discounted && (
                <span className="mr-1.5 text-sm text-neutral line-through">
                  {money(product.compareAt)}
                </span>
              )}
              <span style={{ color: discounted ? 'var(--color-accent)' : 'inherit' }}>
                {money(product.price)}
              </span>
            </p>
          </div>

          <p className="mt-1.5 text-sm text-muted">{product.tagline}</p>

          <p className="label mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>{product.includes.length} cosas dentro</span>
            <span aria-hidden="true">·</span>
            <span>{product.serves === 1 ? 'para una persona' : `para ${product.serves} personas`}</span>
            {rating && (
              <>
                <span aria-hidden="true">·</span>
                <span className="nums">★ {rating}</span>
              </>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
