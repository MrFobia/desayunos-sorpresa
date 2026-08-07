import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import NewsletterForm from './NewsletterForm.jsx';

/* Ft7 · Newsletter-first. La suscripción abre el pie; los enlaces cierran
   en una sola línea, sin las cuatro columnas del pie genérico. */
export default function Footer() {
  const { settings } = useStore();
  const brand = settings?.brand;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-rule bg-paper-2">
      {settings?.sections?.newsletter !== false && (
        <section className="wrap grid gap-8 py-16 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <h2 className="text-3xl">{settings?.newsletter?.title || 'Una carta los viernes'}</h2>
            <p className="measure mt-3 text-muted">{settings?.newsletter?.body}</p>
          </div>
          <NewsletterForm />
        </section>
      )}

      <div className="border-t border-rule">
        <div className="wrap flex flex-col gap-4 py-6 text-sm md:flex-row md:items-center md:justify-between">
          <p className="font-display text-base">
            {brand?.name} · {brand?.city}
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Pie">
            <Link className="link nowrap" to="/desayunos">
              Desayunos
            </Link>
            <Link className="link nowrap" to="/diario">
              Diario
            </Link>
            <Link className="link nowrap" to="/pedido">
              Seguir pedido
            </Link>
            <a className="link nowrap" href={`https://wa.me/${brand?.whatsapp}`}>
              WhatsApp
            </a>
            <Link className="link nowrap" to="/admin">
              Panel
            </Link>
          </nav>
          <p className="text-xs text-muted nowrap">© {year} {brand?.name}</p>
        </div>
      </div>
    </footer>
  );
}
