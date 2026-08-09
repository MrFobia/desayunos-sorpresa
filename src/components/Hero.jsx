import { Link } from 'react-router-dom';
import { money } from '../lib/format.js';

/* Macroestructura Photographic: una fotografía ocupa el pliegue y el texto
   es anotación sobre ella. La versión anterior encajonaba el titular en un
   bloque de color; para un regalo, la imagen tiene que llegar primero. */
const cardStyle = {
  background: 'color-mix(in oklab, var(--color-paper) 94%, transparent)',
  backdropFilter: 'blur(14px)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lift)',
};

function HeroCopy({ hero, cheapest }) {
  return (
    <>
      <p className="label">Bogotá · entrega desde las 6:00 a. m.</p>
      <h1 className="mt-4" style={{ fontSize: 'var(--text-display-s)' }}>
        {hero?.title || 'Llega antes que la alarma.'}
      </h1>
      <p className="measure mt-4 text-muted">{hero?.subtitle}</p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link to="/desayunos" className="btn btn-accent">
          {hero?.ctaLabel || 'Ver los desayunos'}
        </Link>
        <Link to="/pedido" className="btn btn-ghost">
          Seguir un pedido
        </Link>
        {cheapest > 0 && <p className="nums text-sm text-muted">Desde {money(cheapest)}</p>}
      </div>
    </>
  );
}

export default function Hero({ hero, stats, products = [] }) {
  const cheapest = products.length ? Math.min(...products.map((p) => p.price)) : 0;
  const image = hero?.image || '/img/cama-lilas.jpg';

  return (
    <section>
      {/* La fotografía va a sangre y el texto vive en una tarjeta de papel
          apoyada encima. Sobre la foto directa el titular era ilegible: una
          sábana blanca no admite texto claro por mucho velo que se le ponga,
          y oscurecer la imagen entera arruinaba lo único que importa. */}
      <figure className="shot grain relative aspect-4/5 w-full sm:aspect-3/2 md:aspect-auto md:min-h-[84svh]">
        <img
          src={image}
          alt="Bandeja de desayuno servida en la cama, con flores frescas"
          fetchPriority="high"
          width="1800"
          height="1200"
          className="absolute inset-0"
        />

        {/* En escritorio la tarjeta se apoya sobre la foto; en móvil ocuparía
            casi toda la pantalla y taparía la imagen, así que ahí baja debajo. */}
        <figcaption className="relative hidden min-h-[84svh] items-end md:flex">
          <div className="wrap pb-10">
            <div className="rise max-w-xl p-9" style={cardStyle}>
              <HeroCopy hero={hero} cheapest={cheapest} />
            </div>
          </div>
        </figcaption>
      </figure>

      <div className="wrap md:hidden">
        <div className="rise -mt-10 relative p-6" style={cardStyle}>
          <HeroCopy hero={hero} cheapest={cheapest} />
        </div>
      </div>

      {/* Cifras reales, en una banda tipográfica sin cajas */}
      {stats && (
        <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-7 border-b py-8 md:grid-cols-4 md:py-10"
          style={{ borderColor: 'var(--color-rule)' }}>
          {[
            [stats.products, 'desayunos en carta'],
            [stats.addons, 'adicionales para sumar'],
            [stats.slots, 'franjas de entrega'],
            [stats.earliest, 'la primera sale a las'],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="nums font-display text-3xl leading-none md:text-4xl">{value}</dt>
              <dd className="label mt-2">{label}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
