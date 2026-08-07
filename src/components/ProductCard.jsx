import { Link } from 'react-router-dom';
import { money, categoryLabel } from '../lib/format.js';

/**
 * Ficha de producto. `emphasis` cambia la proporción del recorte para que la
 * grilla no quede toda igual: la primera pieza de cada fila respira distinto.
 */
export default function ProductCard({ product, emphasis = false, priority = false }) {
  const discounted = product.compareAt && product.compareAt > product.price;

  return (
    <article className="group">
      <Link to={`/desayunos/${product.slug}`} className="block">
        <div
          className={`relative overflow-hidden rounded-sm ${emphasis ? 'aspect-4/5' : 'aspect-3/4'}`}
          style={{ background: 'var(--color-paper-3)' }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            width="640"
            height="800"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          {discounted && (
            <span
              className="nums absolute left-3 top-3 rounded-pill px-2.5 py-1 text-xs"
              style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
            >
              −{Math.round((1 - product.price / product.compareAt) * 100)} %
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h3 className="text-base leading-tight sm:text-lg">{product.name}</h3>
          <p className="nums shrink-0 text-right text-sm sm:text-base">
            {discounted && (
              <span className="mr-1.5 text-sm text-muted line-through">{money(product.compareAt)}</span>
            )}
            <span style={{ color: discounted ? 'var(--color-accent)' : 'inherit' }}>
              {money(product.price)}
            </span>
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">{product.tagline}</p>
      </Link>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral">
        <span>{categoryLabel(product.category)}</span>
        <span aria-hidden="true">·</span>
        <span>{product.serves === 1 ? 'Para una persona' : `Para ${product.serves} personas`}</span>
        {product.badges?.map((badge) => (
          <span
            key={badge}
            className="rounded-pill px-2 py-0.5"
            style={{
              background: badge === 'Sin azúcar añadida' ? 'var(--color-leaf-soft)' : 'var(--color-accent-soft)',
              color: badge === 'Sin azúcar añadida' ? 'var(--color-leaf)' : 'var(--color-accent-strong)',
            }}
          >
            {badge}
          </span>
        ))}
      </p>
    </article>
  );
}
