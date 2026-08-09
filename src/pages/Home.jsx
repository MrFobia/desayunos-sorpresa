import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import Hero from '../components/Hero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { money, shortDate, categoryLabel } from '../lib/format.js';

const FruitScene = lazy(() => import('../components/FruitScene.jsx'));

/* La escena WebGL sólo se descarga si el dispositivo lo justifica. */
function useCanRender3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
    const calm = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const evaluate = () =>
      setOk(wide.matches && calm.matches && navigator.connection?.saveData !== true);
    evaluate();
    wide.addEventListener('change', evaluate);
    calm.addEventListener('change', evaluate);
    return () => {
      wide.removeEventListener('change', evaluate);
      calm.removeEventListener('change', evaluate);
    };
  }, []);
  return ok;
}

/* Ocasiones: la puerta de entrada real de un regalo. Alguien no busca
   «dulces», busca «aniversario». Cada una enlaza a una categoría. */
const OCCASIONS = [
  { category: 'romanticos', title: 'Aniversario', image: '/img/bandeja-flores-cama.jpg' },
  { category: 'infantiles', title: 'Cumpleaños', image: '/img/panqueques-bandeja.jpg' },
  { category: 'saludables', title: 'Primer día', image: '/img/bowl-aguacate.jpg' },
  { category: 'clasicos', title: 'Una disculpa', image: '/img/te-luces.jpg' },
];

export default function Home() {
  const { products, posts, settings, stats, loading, error } = useStore();
  const can3D = useCanRender3D();

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

  const anySold = products.some((p) => p.sold > 0);
  const best = [...products]
    .sort((a, b) =>
      anySold ? b.sold - a.sold : Number(b.featured) - Number(a.featured) || a.price - b.price,
    )
    .slice(0, 3);
  const bestIds = new Set(best.map((p) => p.id));
  const rest = products.filter((p) => !bestIds.has(p.id));
  const offer = products.find((p) => p.compareAt && p.compareAt > p.price);
  const sections = settings?.sections || {};

  return (
    <>
      <Hero hero={settings?.hero} stats={stats} products={products} />

      {/* --------------------------------------------------------- ocasiones */}
      <section className="wrap py-16 md:py-24">
        <Reveal>
          <p className="label">Para qué día</p>
          <h2 className="mt-3 max-w-[18ch]" style={{ fontSize: 'var(--text-display-s)' }}>
            Nadie pide un desayuno. Pide una mañana.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">
          {OCCASIONS.map((occasion, i) => (
            <Reveal key={occasion.title} delay={i * 70}>
              <Link to={`/desayunos?c=${occasion.category}`} className="group block">
                <div className="shot shot-zoom aspect-3/4">
                  <img
                    src={occasion.image}
                    alt=""
                    loading="lazy"
                    width="700"
                    height="933"
                  />
                </div>
                <h3 className="mt-3.5 text-lg">{occasion.title}</h3>
                <p className="label mt-1">{categoryLabel(occasion.category)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ más pedidos */}
      {sections.bestsellers !== false && best.length > 0 && (
        <section className="wrap pb-16 md:pb-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div>
              <p className="label">
                {anySold ? 'Ordenados por unidades vendidas' : 'Los que marcamos como destacados'}
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl">Los más pedidos</h2>
            </div>
            <Link to="/desayunos" className="link nowrap text-sm">
              Ver las ocho cajas
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">
            {best.map((product, i) => (
              <Reveal key={product.id} delay={i * 70}>
                <ProductCard product={product} priority={i < 2} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------ franja fotográfica ancha */}
      <section className="relative">
        <figure className="shot veil-full grain relative aspect-4/5 sm:aspect-16/9 lg:aspect-21/9">
          <img
            src="/img/bandeja-madera-frutos.jpg"
            alt="Bandeja de madera con arándanos, frutos rojos y café"
            loading="lazy"
            width="1800"
            height="1000"
            className="absolute inset-0"
          />
          <figcaption className="relative flex h-full items-center">
            <div className="wrap" style={{ color: 'var(--color-paper)' }}>
              <Reveal className="max-w-xl">
                <p className="label" style={{ color: 'inherit', opacity: 0.75 }}>
                  Cómo trabajamos
                </p>
                <blockquote className="mt-4" style={{ fontSize: 'var(--text-display-s)' }}>
                  La fruta se corta a las 4:10. El jugo se exprime a las 4:40.
                </blockquote>
                <p className="mt-5 text-md" style={{ opacity: 0.85 }}>
                  La tarjeta se escribe de última, para que la tinta no se corra.
                </p>
                <Link to="/diario/como-armamos-una-caja" className="btn btn-onphoto mt-7">
                  Leer cómo se arma una caja
                </Link>
              </Reveal>
            </div>
          </figcaption>
        </figure>
      </section>

      {/* ------------------------------------------------------ tres pasos */}
      <section className="wrap py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-16">
          <Reveal>
            <p className="label">Cómo funciona</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Tres pasos y listo</h2>
            <ol className="mt-8 divide-y" style={{ borderColor: 'var(--color-rule)' }}>
              {[
                ['01', 'Elegís la caja', 'Quitá lo que no va y sumá adicionales.'],
                ['02', 'Ponés día y hora', settings?.delivery?.cutoffNote || ''],
                ['03', 'Llega y avisamos', 'Te escribimos cuando sale el domiciliario.'],
              ].map(([n, title, body]) => (
                <li key={n} className="flex gap-5 py-5 first:pt-0" style={{ borderColor: 'var(--color-rule)' }}>
                  <span className="label nums pt-1">{n}</span>
                  <span>
                    <span className="block text-lg leading-snug">{title}</span>
                    <span className="mt-1 block text-sm text-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={90}>
            <div className="shot aspect-4/3">
              <img
                src="/img/bandeja-flores-alta.jpg"
                alt="Bandeja con flores, croissant y café servida sobre la cama"
                loading="lazy"
                width="1400"
                height="1050"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- oferta */}
      {sections.offers !== false && settings?.offers?.active && offer && (
        <section className="wrap pb-16 md:pb-24">
          <Reveal>
            <Link
              to={`/desayunos/${offer.slug}`}
              className="group grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-12"
            >
              <div className="shot shot-zoom aspect-16/10">
                <img src={offer.images[0]} alt={offer.name} loading="lazy" width="1400" height="875" />
              </div>
              <div>
                <p className="label">{settings.offers.title}</p>
                <h2 className="mt-3 text-3xl md:text-4xl">{offer.name}</h2>
                <p className="measure mt-3 text-muted">{offer.tagline}</p>
                <p className="nums mt-5 flex items-baseline gap-3">
                  <span className="text-neutral line-through">{money(offer.compareAt)}</span>
                  <span className="font-display text-3xl" style={{ color: 'var(--color-accent)' }}>
                    {money(offer.price)}
                  </span>
                </p>
                <p className="label mt-2">{settings.offers.note}</p>
                <span className="btn btn-primary mt-6">Ver la caja</span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ---------------------------------------------- el resto de la carta */}
      {sections.catalog !== false && rest.length > 0 && (
        <section className="wrap pb-16 md:pb-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h2 className="text-3xl md:text-4xl">El resto de la carta</h2>
            <Link to="/desayunos" className="link nowrap text-sm">
              Ver las ocho con filtros
            </Link>
          </Reveal>
          {/* Cuatro columnas, no cinco: a cinco, «Brunch Gourmet» se partía
              en mitades y los nombres dejaban de leerse. */}
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {rest.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------- escena de fruta */}
      {can3D && (
        <section className="border-y" style={{ borderColor: 'var(--color-rule)', background: 'var(--color-paper-2)' }}>
          <div className="wrap grid gap-8 py-16 md:grid-cols-[1fr_1.1fr] md:items-center md:py-20">
            <Reveal>
              <p className="label">Fruta del día</p>
              <h2 className="mt-3 text-3xl md:text-4xl">Lo que entra en el bol cambia cada semana</h2>
              <p className="measure mt-4 text-muted">
                Compramos en plaza el mismo día. Si el kiwi no está bueno, no va: entra lo que sí.
                Movelo con el mouse para verlo de cerca.
              </p>
            </Reveal>
            <div className="aspect-4/3">
              <Suspense fallback={<div className="shot h-full w-full" />}>
                <FruitScene />
              </Suspense>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ diario */}
      {sections.blog !== false && posts.length > 0 && (
        <section className="wrap py-16 md:py-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h2 className="text-3xl md:text-4xl">Diario de cocina</h2>
            <Link to="/diario" className="link nowrap text-sm">
              Todas las notas
            </Link>
          </Reveal>
          <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">
            {posts.slice(0, 3).map((post, i) => (
              <Reveal key={post.id} delay={i * 70}>
                <article className="group">
                  <Link to={`/diario/${post.slug}`} className="block">
                    <div className="shot shot-zoom aspect-4/3">
                      <img src={post.cover} alt="" loading="lazy" width="700" height="525" />
                    </div>
                    <p className="label mt-4">{shortDate(post.date)}</p>
                    <h3 className="mt-1.5 text-xl leading-snug">{post.title}</h3>
                    <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="min-h-[78svh] w-full" style={{ background: 'var(--color-paper-3)' }} />
      <div className="wrap grid grid-cols-2 gap-6 py-16 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shot aspect-3/4" />
        ))}
      </div>
      <p className="sr-only">Cargando la carta…</p>
    </div>
  );
}
