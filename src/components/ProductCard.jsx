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

        <div className="pt-3.5">
          <p className="label label-tight">{categoryLabel(product.category)}</p>

          {/* El nombre ocupa el ancho completo y el precio va debajo. Cuando
              compartían línea, en dos columnas de móvil al título le quedaban
              ~80 px y partía las palabras: «Cesta Campestr / e». */}
          <h3
            className={`mt-1.5 hyphen-es ${size === 'lead' ? 'text-xl sm:text-2xl' : 'title-2l text-base sm:text-lg'}`}
          >
            {product.name}
          </h3>

          <p className="nums mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <span
              className={size === 'lead' ? 'text-lg' : 'text-base'}
              style={{ color: discounted ? 'var(--color-accent)' : 'inherit' }}
            >
              {money(product.price)}
            </span>
            {discounted && (
              <span className="text-sm text-neutral line-through">{money(product.compareAt)}</span>
            )}
          </p>

          {/* Dos líneas como máximo: así las tarjetas vecinas no quedan
              desalineadas por una descripción más larga que la otra. */}
          <p className="mt-2 line-clamp-2 text-sm text-muted">{product.tagline}</p>

          <p className="label label-tight mt-2.5">
            {product.includes.length} cosas · {product.serves === 1 ? '1 persona' : `${product.serves} personas`}
            {rating && <span className="nums"> · ★ {rating}</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}
