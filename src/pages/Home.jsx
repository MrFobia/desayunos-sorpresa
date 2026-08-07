import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import Hero from '../components/Hero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import CatalogGrid from '../components/CatalogGrid.jsx';
import { money, shortDate, categoryLabel } from '../lib/format.js';

export default function Home() {
  const { products, posts, settings, stats, loading, error } = useStore();

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

  /* Los más pedidos salen de las ventas reales; si todavía no hay pedidos,
     caen a los que el panel marcó como destacados. */
  const anySold = products.some((p) => p.sold > 0);
  const best = [...products]
    .sort((a, b) =>
      anySold ? b.sold - a.sold : Number(b.featured) - Number(a.featured) || a.price - b.price,
    )
    .slice(0, 4);

  const bestIds = new Set(best.map((p) => p.id));
  const rest = products.filter((p) => !bestIds.has(p.id));
  const offers = products.filter((p) => p.compareAt && p.compareAt > p.price);
  const categories = [...new Set(products.map((p) => p.category))];
  const sections = settings?.sections || {};

  return (
    <>
      <Hero hero={settings?.hero} stats={stats} products={products} />

      {/* Rieles de categoría: la primera decisión del usuario, a un toque */}
      <section className="wrap py-8">
        <div className="rail md:grid-flow-row md:grid-cols-6 md:overflow-visible">
          {categories.map((category) => {
            const sample = products.find((p) => p.category === category);
            return (
              <Link
                key={category}
                to={`/desayunos?c=${category}`}
                className="tile flex items-center gap-3 p-2 transition-shadow duration-200 hover:shadow-[var(--shadow-hard-sm)] md:flex-col md:items-start md:p-0"
              >
                <img
                  src={sample.images[0]}
                  alt=""
                  loading="lazy"
                  width="120"
                  height="120"
                  className="h-12 w-12 shrink-0 rounded-sm object-cover md:h-auto md:w-full md:rounded-none md:aspect-4/3"
                />
                <span className="text-sm leading-tight md:px-3 md:pb-2.5 md:pt-2">
                  {categoryLabel(category)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {sections.bestsellers !== false && best.length > 0 && (
        <section className="wrap pb-12 md:pb-16">
          <SectionHead
            title="Los más pedidos"
            note={anySold ? 'Ordenados por unidades vendidas.' : 'Los que marcamos como destacados.'}
            to="/desayunos"
            cta="Ver la carta completa"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {best.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </section>
      )}

      {/* Bento: promo, proceso y datos reales conviviendo en una pantalla */}
      <section className="wrap pb-12 md:pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <PromoTile settings={settings} offers={offers} />

          <div className="tile tile-yolk p-5 md:p-6">
            <h2 className="text-2xl">Cómo funciona</h2>
            <ol className="mt-4 space-y-3.5">
              {[
                ['1', 'Elegís la caja', 'Quitá lo que no va y sumá adicionales.'],
                ['2', 'Ponés día y hora', settings?.delivery?.cutoffNote || ''],
                ['3', 'Llega y avisamos', 'Te escribimos cuando sale el domiciliario.'],
              ].map(([n, title, body]) => (
                <li key={n} className="flex gap-3">
                  <span className="nums font-display text-2xl leading-none">{n}</span>
                  <span>
                    <span className="block leading-tight">{title}</span>
                    <span className="block text-sm opacity-80">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="tile tile-dark grain p-5 md:p-6">
            <h2 className="text-2xl">La caja incluye siempre</h2>
            <ul className="mt-4 space-y-2 text-sm opacity-90">
              <li>Tarjeta escrita a mano con tu mensaje</li>
              <li>Cubiertos y servilleta de tela</li>
              <li>Fruta cortada esa misma madrugada</li>
              <li>Aviso por WhatsApp cuando sale el pedido</li>
            </ul>
            <p className="nums mt-5 border-t pt-4 text-sm" style={{ borderColor: 'var(--color-espresso-2)' }}>
              Domicilio gratis desde {money(settings?.delivery?.freeFrom || 0)}
            </p>
          </div>
        </div>
      </section>

      {sections.offers !== false && settings?.offers?.active && offers.length > 0 && (
        <section className="wrap pb-12 md:pb-16">
          <SectionHead title={settings.offers.title} note={settings.offers.note} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* El resto de la carta, sin repetir los que ya se mostraron arriba.
          Con ocho productos, volver a listarlos todos hacía que el home se
          leyera dos veces igual. */}
      {sections.catalog !== false && rest.length > 0 && (
        <section className="border-t border-rule bg-paper-2">
          <div className="wrap py-12 md:py-16">
            <SectionHead
              title="El resto de la carta"
              note="Los filtros completos están en la carta."
              to="/desayunos"
              cta="Ver las ocho"
            />
            <div className="mt-6">
              {/* Sin filtros acá: mostrarían menos categorías que la carta real
                  y confundirían. El filtrado vive en /desayunos. */}
              <CatalogGrid products={rest} showFilters={false} />
            </div>
          </div>
        </section>
      )}

      {sections.blog !== false && posts.length > 0 && (
        <section className="wrap py-12 md:py-16">
          <SectionHead title="Diario de cocina" to="/diario" cta="Todas las notas" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="tile group">
                <Link to={`/diario/${post.slug}`} className="block">
                  <div className="aspect-16/10 overflow-hidden" style={{ background: 'var(--color-paper-3)' }}>
                    <img
                      src={post.cover}
                      alt=""
                      loading="lazy"
                      width="640"
                      height="400"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="chip">{shortDate(post.date)}</p>
                    <h3 className="mt-2 text-lg leading-tight">{post.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{post.excerpt}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SectionHead({ title, note, to, cta }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 className="text-3xl">{title}</h2>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      </div>
      {to && (
        <Link to={to} className="btn btn-ghost nowrap">
          {cta} →
        </Link>
      )}
    </div>
  );
}

/** Bloque promocional: usa la oferta real si existe, si no invita a la carta. */
function PromoTile({ settings, offers }) {
  const promo = offers[0];
  if (!promo) {
    return (
      <div className="tile tile-accent grain flex flex-col justify-between p-5 md:p-6">
        <h2 className="text-2xl">Se puede pedir para mañana</h2>
        <p className="mt-2 text-sm opacity-90">{settings?.delivery?.cutoffNote}</p>
        <Link to="/desayunos" className="btn btn-ink mt-5 self-start">
          Ver la carta
        </Link>
      </div>
    );
  }

  const off = Math.round((1 - promo.price / promo.compareAt) * 100);

  return (
    <Link
      to={`/desayunos/${promo.slug}`}
      className="tile group relative flex min-h-56 flex-col justify-end p-5 md:p-6"
    >
      <img
        src={promo.images[0]}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      {/* Velo oscuro parejo: la foto se ve entera y el texto queda legible.
          Bajarle la opacidad a la imagen sobre el rojo la dejaba lavada. */}
      <div
        className="absolute inset-0"
        style={{ background: 'color-mix(in oklab, var(--color-ink-deep) 62%, transparent)' }}
      />
      <div className="relative" style={{ color: 'var(--color-paper)' }}>
        <span className="chip chip-solid nums">−{off} % esta semana</span>
        <h2 className="mt-3 text-3xl">{promo.name}</h2>
        <p className="nums mt-1.5">
          <span className="mr-2 opacity-70 line-through">{money(promo.compareAt)}</span>
          <span className="font-display text-2xl">{money(promo.price)}</span>
        </p>
      </div>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <div className="wrap py-16" aria-busy="true" aria-live="polite">
      <div className="h-10 w-2/3 rounded-sm" style={{ background: 'var(--color-paper-3)' }} />
      <div className="mt-4 h-5 w-1/2 rounded-sm" style={{ background: 'var(--color-paper-3)' }} />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-3/4 rounded-lg" style={{ background: 'var(--color-paper-3)' }} />
        ))}
      </div>
      <p className="sr-only">Cargando la carta…</p>
    </div>
  );
}
