import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import CartDrawer from './CartDrawer.jsx';

const LINKS = [
  { to: '/desayunos', label: 'Desayunos' },
  { to: '/diario', label: 'Diario' },
  { to: '/pedido', label: 'Seguir pedido' },
];

/* N6 · Masthead de periódico. La cabecera grande vive arriba de la página;
   al bajar 240 px aparece una barra compacta pegajosa con lo esencial. */
export default function Masthead() {
  const { settings, totals, user, cartOpen, setCartOpen } = useStore();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 240);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const brand = settings?.brand?.name || 'Aurora Desayunos';

  return (
    <>
      {settings?.banner?.active && (
        <div className="bg-ink-deep text-paper">
          <div className="wrap py-2 text-center text-xs tracking-wide">{settings.banner.text}</div>
        </div>
      )}

      <header className="border-b border-rule bg-paper">
        <div className="wrap pt-6 pb-3 md:pt-9">
          <div className="flex items-center justify-between gap-4 md:justify-center">
            <Link
              to="/"
              className="font-display text-xl leading-none tracking-tight md:text-4xl"
              style={{ fontWeight: 600 }}
            >
              {brand}
            </Link>
            <div className="flex shrink-0 items-center gap-1.5 md:hidden">
              <CartButton count={totals.count} onClick={() => setCartOpen(true)} compact />
              <button
                type="button"
                className="btn btn-ghost px-3"
                aria-expanded={menuOpen}
                aria-controls="menu-movil"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? 'Cerrar' : 'Menú'}
              </button>
            </div>
          </div>
          <p className="mt-2 hidden text-center text-sm text-muted md:block">
            {settings?.brand?.tagline}
          </p>
        </div>

        <div className="border-t border-rule">
          <div className="wrap hidden items-center justify-between py-2 md:flex">
            <nav className="flex items-center gap-6" aria-label="Principal">
              {LINKS.map((l) => (
                <MainLink key={l.to} {...l} />
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/cuenta" className="link nowrap text-sm">
                {user ? user.name.split(' ')[0] : 'Ingresar'}
              </Link>
              <CartButton count={totals.count} onClick={() => setCartOpen(true)} />
            </div>
          </div>
        </div>

        {menuOpen && (
          <nav id="menu-movil" className="border-t border-rule md:hidden" aria-label="Principal móvil">
            <ul className="wrap flex flex-col py-2">
              {[...LINKS, { to: '/cuenta', label: user ? 'Mi cuenta' : 'Ingresar' }].map((l) => (
                <li key={l.to} className="border-b border-rule last:border-0">
                  <NavLink to={l.to} className="block py-3 nowrap">
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Barra compacta pegajosa */}
      <div
        className={`fixed inset-x-0 top-0 border-b border-rule bg-paper/95 backdrop-blur transition-transform duration-200 ${
          compact ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ zIndex: 'var(--z-sticky)' }}
        aria-hidden={!compact}
      >
        <div className="wrap flex items-center justify-between gap-4 py-2">
          <Link to="/" className="font-display text-lg nowrap" tabIndex={compact ? 0 : -1}>
            {brand}
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Principal compacta">
            {LINKS.map((l) => (
              <MainLink key={l.to} {...l} tabIndex={compact ? 0 : -1} />
            ))}
          </nav>
          <CartButton count={totals.count} onClick={() => setCartOpen(true)} tabIndex={compact ? 0 : -1} />
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

/* Marca de canasta dibujada a mano: una sola pieza gráfica propia,
   en vez de mezclar una librería de íconos por un solo glifo. */
function BagMark() {
  return (
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" aria-hidden="true">
      <path d="M2.2 5.5h11.6l-1 9.5a1 1 0 0 1-1 .9H4.2a1 1 0 0 1-1-.9l-1-9.5Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.4 7V4.3a2.6 2.6 0 0 1 5.2 0V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MainLink({ to, label, tabIndex }) {
  return (
    <NavLink
      to={to}
      tabIndex={tabIndex}
      className={({ isActive }) =>
        `link nowrap text-sm ${isActive ? 'text-accent' : ''}`
      }
    >
      {label}
    </NavLink>
  );
}

function CartButton({ count, onClick, tabIndex, compact }) {
  return (
    <button
      type="button"
      className={`btn btn-ghost nowrap ${compact ? 'px-3' : ''}`}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={`Carrito, ${count} ${count === 1 ? 'caja' : 'cajas'}`}
    >
      {compact ? <BagMark /> : <span>Carrito</span>}
      <span
        className="nums inline-flex min-w-5 items-center justify-center rounded-pill px-1.5 text-xs"
        style={{
          background: count ? 'var(--color-accent)' : 'var(--color-paper-3)',
          color: count ? 'var(--color-paper)' : 'var(--color-muted)',
        }}
      >
        {count}
      </span>
    </button>
  );
}
