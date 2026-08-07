import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import Hero from '../components/Hero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import CatalogGrid from '../components/CatalogGrid.jsx';
import { money, shortDate } from '../lib/format.js';

export default function Home() {
  const { products, posts, settings, loading, error } = useStore();

  if (error) {
    return (
      <div className="wrap py-24">
        <h1 className="text-2xl">No pudimos cargar la carta</h1>
        <p className="mt-3 text-muted">{error}</p>
        <p className="mt-1 text-sm text-muted">
          Revisá que la API esté corriendo: <code>npm run dev</code> levanta las dos partes.
        </p>
      </div>
    );
  }

  if (loading) return <HomeSkeleton />;

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const offers = products.filter((p) => p.compareAt && p.compareAt > p.price);
  const sections = settings?.sections || {};

  return (
    <>
      <Hero hero={settings?.hero} />

      {/* Barra de garantías: hechos verificables del servicio, sin métricas inventadas */}
      <section className="border-b border-rule">
        <ul className="wrap grid gap-y-3 py-5 text-sm sm:grid-cols-3">
          <li>Entrega entre las 6:00 y las 11:00 a. m.</li>
          <li>Tarjeta escrita a mano, sin costo</li>
          <li className="nums">
            Domicilio gratis desde {money(settings?.delivery?.freeFrom || 0)}
          </li>
        </ul>
      </section>

      {/* Una pieza grande y dos al costado: si esta sección usara la misma
          grilla de tres que el catálogo, el home se leería dos veces igual. */}
      {sections.bestsellers !== false && featured.length > 0 && (
        <section className="wrap py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl">Los más pedidos</h2>
            <Link to="/desayunos" className="btn btn-quiet nowrap">
              Ver la carta completa →
            </Link>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-10">
            <FeatureLead product={featured[0]} />
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1">
              {featured.slice(1).map((product) => (
                <ProductCard key={product.id} product={product} priority />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cómo funciona — narrativa numerada, no una grilla de íconos */}
      <section className="border-y border-rule bg-paper-2">
        <div className="wrap py-16 md:py-20">
          <h2 className="text-3xl">Cómo funciona</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              {
                n: '1',
                t: 'Elegís la caja',
                d: 'Ocho desayunos fijos. Podés quitar lo que no quieras y sumar adicionales.',
              },
              {
                n: '2',
                t: 'Ponés día y hora',
                d: `Franjas de una hora entre las 6:00 y las 11:00. ${settings?.delivery?.cutoffNote || ''}`,
              },
              {
                n: '3',
                t: 'Llega y avisamos',
                d: 'Te escribimos por WhatsApp cuando el domiciliario sale con la caja.',
              },
            ].map((step) => (
              <li key={step.n}>
                <p className="nums font-display text-4xl leading-none" style={{ color: 'var(--color-accent)' }}>
                  {step.n}
                </p>
                <h3 className="mt-3 text-lg">{step.t}</h3>
                <p className="measure mt-1.5 text-sm text-muted">{step.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {sections.offers !== false && settings?.offers?.active && offers.length > 0 && (
        <section className="wrap py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl">{settings.offers.title}</h2>
            <p className="text-sm text-muted">{settings.offers.note}</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {sections.catalog !== false && (
        <section className="border-t border-rule">
          <div className="wrap py-16 md:py-20">
            <h2 className="text-3xl">Toda la carta</h2>
            <p className="measure mt-2 text-muted">
              Ocho desayunos. Filtrá por tipo, precio o para cuántas personas.
            </p>
            <div className="mt-8">
              <CatalogGrid products={products} />
            </div>
          </div>
        </section>
      )}

      {sections.blog !== false && posts.length > 0 && (
        <section className="border-t border-rule bg-paper-2">
          <div className="wrap py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl">Diario de cocina</h2>
              <Link to="/diario" className="btn btn-quiet nowrap">
                Todas las notas →
              </Link>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <article key={post.id}>
                  <Link to={`/diario/${post.slug}`} className="group block">
                    <div className="aspect-16/10 overflow-hidden rounded-sm" style={{ background: 'var(--color-paper-3)' }}>
                      <img
                        src={post.cover}
                        alt=""
                        loading="lazy"
                        width="640"
                        height="400"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="mt-3 text-xs text-neutral">{shortDate(post.date)}</p>
                    <h3 className="mt-1 text-lg leading-tight">{post.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{post.excerpt}</p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/** Pieza principal de «Los más pedidos»: foto alta y ficha debajo. */
function FeatureLead({ product }) {
  if (!product) return null;
  return (
    <article>
      <Link to={`/desayunos/${product.slug}`} className="group block">
        <div
          className="aspect-4/3 overflow-hidden rounded-sm md:aspect-3/2"
          style={{ background: 'var(--color-paper-3)' }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            width="1400"
            height="930"
            fetchPriority="high"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-2xl leading-tight">{product.name}</h3>
          <p className="nums text-lg">{money(product.price)}</p>
        </div>
        <p className="measure mt-2 text-muted">{product.tagline}</p>
      </Link>
      <p className="mt-3 text-sm text-neutral">
        {product.includes.length} cosas dentro ·{' '}
        {product.serves === 1 ? 'para una persona' : `para ${product.serves} personas`}
      </p>
    </article>
  );
}

function HomeSkeleton() {
  return (
    <div className="wrap py-16" aria-busy="true" aria-live="polite">
      <div className="h-10 w-2/3 rounded-sm" style={{ background: 'var(--color-paper-3)' }} />
      <div className="mt-4 h-5 w-1/2 rounded-sm" style={{ background: 'var(--color-paper-3)' }} />
      <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-3/4 rounded-sm" style={{ background: 'var(--color-paper-3)' }} />
        ))}
      </div>
      <p className="sr-only">Cargando la carta…</p>
    </div>
  );
}
