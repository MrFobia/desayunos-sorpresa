import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { categoryLabel, money } from '../lib/format.js';
import NewsletterForm from './NewsletterForm.jsx';

/* Ft4 · Colofón denso. Cierra con información operativa real —franjas,
   ciudades, umbral de domicilio— y no con cuatro columnas de enlaces
   inventados. La suscripción abre el bloque. */
export default function Footer() {
  const { settings, products } = useStore();
  const brand = settings?.brand;
  const delivery = settings?.delivery;
  const year = new Date().getFullYear();
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <footer className="panel-dark grain relative relative mt-16 border-0">
      <div className="relative">
        {settings?.sections?.newsletter !== false && (
          <section className="wrap grid gap-8 border-b py-12 md:grid-cols-[1.1fr_1fr] md:items-end"
            style={{ borderColor: 'var(--color-espresso-2)' }}>
            <div>
              <h2 className="text-3xl">{settings?.newsletter?.title || 'Una carta los viernes'}</h2>
              <p className="measure mt-3 opacity-80">{settings?.newsletter?.body}</p>
            </div>
            <NewsletterForm dark />
          </section>
        )}

        <div className="wrap grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-xl">{brand?.name}</p>
            <p className="mt-2 text-sm opacity-70">{brand?.tagline}</p>
            <a className="link mt-4 inline-block text-sm" style={{ color: 'var(--color-paper)' }} href={`https://wa.me/${brand?.whatsapp}`}>
              Escríbenos por WhatsApp
            </a>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest opacity-60">Entregas</h3>
            <ul className="nums mt-2.5 space-y-1 text-sm opacity-85">
              {delivery?.slots?.map((slot) => (
                <li key={slot}>{slot}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm opacity-70">{delivery?.cutoffNote}</p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest opacity-60">Dónde llegamos</h3>
            <ul className="mt-2.5 space-y-1 text-sm opacity-85">
              {delivery?.cities?.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
            <p className="nums mt-3 text-sm opacity-70">
              Domicilio {money(delivery?.fee || 0)} · gratis desde {money(delivery?.freeFrom || 0)}
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest opacity-60">La carta</h3>
            <ul className="mt-2.5 space-y-1 text-sm">
              {categories.map((category) => (
                <li key={category}>
                  <Link to={`/desayunos?c=${category}`} className="opacity-85 hover:opacity-100">
                    {categoryLabel(category)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: 'var(--color-espresso-2)' }}>
          <div className="wrap flex flex-col gap-3 py-5 text-sm md:flex-row md:items-center md:justify-between">
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 opacity-85" aria-label="Pie">
              <Link className="nowrap hover:opacity-100" to="/desayunos">
                Desayunos
              </Link>
              <Link className="nowrap hover:opacity-100" to="/diario">
                Diario
              </Link>
              <Link className="nowrap hover:opacity-100" to="/pedido">
                Seguir pedido
              </Link>
              <Link className="nowrap hover:opacity-100" to="/cuenta">
                Mi cuenta
              </Link>
              <Link className="nowrap hover:opacity-100" to="/admin">
                Panel
              </Link>
            </nav>
            <p className="text-xs opacity-60 nowrap">
              © {year} {brand?.name} · {brand?.city}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
