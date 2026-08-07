import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

/* Macroestructura Marquee Hero: el titular ocupa el pliegue y la escena vive
   al lado; el primer CTA aparece abajo del corte, no encima de la fotografía. */
export default function Hero({ hero, ctaHref = '/desayunos' }) {
  const can3D = useCanRender3D();

  return (
    <section className="border-b border-rule bg-paper-2">
      <div className="wrap grid gap-8 pt-12 pb-10 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-12 md:pt-16 md:pb-14">
        <div className="rise">
          <h1
            className="tracking-tight"
            style={{ fontSize: 'var(--text-display)', fontWeight: 600 }}
          >
            {hero?.title || 'Llega antes que la alarma.'}
          </h1>
          <p className="measure mt-5 text-md text-muted">{hero?.subtitle}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to={ctaHref} className="btn btn-primary">
              {hero?.ctaLabel || 'Ver los desayunos'}
            </Link>
            <Link to="/pedido" className="btn btn-ghost">
              Seguir un pedido
            </Link>
          </div>
        </div>

        <div
          className={`relative aspect-4/5 overflow-hidden md:aspect-square ${
            can3D ? '' : 'rounded-sm'
          }`}
          style={{ background: can3D ? 'transparent' : 'var(--color-paper-3)' }}
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
              height="1400"
            />
          )}
        </div>
      </div>
    </section>
  );
}
