import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../lib/format.js';

const FruitScene = lazy(() => import('./FruitScene.jsx'));

/* El WebGL sólo se descarga si el dispositivo lo justifica: pantalla ancha,
   sin `prefers-reduced-motion` y sin ahorro de datos. En el resto de los casos
   queda la fotografía, que es igual de válida como imagen de portada. */
function useCanRender3D() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
    const calm = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const saveData = navigator.connection?.saveData === true;
    const evaluate = () => setOk(wide.matches && calm.matches && !saveData);
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

/* Macroestructura Bento Grid: el pliegue es una rejilla de bloques de distinto
   tamaño —titular, escena, precio de entrada, franjas— en vez de un titular
   solo con mucho aire al costado. */
export default function Hero({ hero, stats, products = [] }) {
  const can3D = useCanRender3D();
  const cheapest = products.length ? Math.min(...products.map((p) => p.price)) : 0;

  return (
    <section className="wrap pt-6 pb-8 md:pt-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bloque titular */}
        <div className="tile tile-dark grain relative flex flex-col justify-between p-6 md:p-8 lg:col-span-2">
          <div className="relative rise">
            <span className="chip chip-solid">Bogotá y alrededores</span>
            <h1 className="mt-4 tracking-tight" style={{ fontSize: 'var(--text-display-s)' }}>
              {hero?.title || 'Llega antes que la alarma.'}
            </h1>
            <p className="measure mt-4 opacity-85">{hero?.subtitle}</p>
          </div>

          <div className="relative mt-7 flex flex-wrap items-center gap-3">
            <Link to="/desayunos" className="btn btn-primary">
              {hero?.ctaLabel || 'Ver los desayunos'}
            </Link>
            <Link
              to="/pedido"
              className="btn btn-ghost"
              style={{ color: 'var(--color-paper)', borderColor: 'var(--color-espresso-2)' }}
            >
              Seguir un pedido
            </Link>
            {cheapest > 0 && (
              <p className="nums text-sm opacity-75">Desde {money(cheapest)}</p>
            )}
          </div>
        </div>

        {/* Bloque de la escena */}
        <div
          className="tile relative aspect-4/3 overflow-hidden lg:aspect-auto lg:min-h-[24rem]"
          style={{ background: 'var(--color-paper-2)' }}
        >
          {can3D ? (
            <Suspense
              fallback={
                <img
                  src={hero?.image || '/img/waffles-frutas.jpg'}
                  alt=""
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              }
            >
              <FruitScene />
            </Suspense>
          ) : (
            <img
              src={hero?.image || '/img/waffles-frutas.jpg'}
              alt="Waffles con frutas y café, servidos sobre una mesa de madera"
              className="h-full w-full object-cover"
              fetchPriority="high"
              width="1400"
              height="1050"
            />
          )}
        </div>
      </div>

      {/* Cifras: todas salen de la base, ninguna está inventada */}
      {stats && (
        <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            [stats.products, 'desayunos en carta'],
            [stats.addons, 'adicionales para sumar'],
            [stats.slots, 'franjas de entrega'],
            [stats.earliest, 'la primera entrega'],
          ].map(([value, label]) => (
            <div key={label} className="tile px-4 py-3.5">
              <dt className="nums font-display text-3xl leading-none">{value}</dt>
              <dd className="mt-1.5 text-sm text-muted">{label}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
