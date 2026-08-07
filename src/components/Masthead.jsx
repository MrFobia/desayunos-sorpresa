import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { categoryLabel, money } from '../lib/format.js';
import CartDrawer from './CartDrawer.jsx';

/* N11 · Mega-menú con buscador.
   La cabecera es una sola barra pegajosa: marca, categorías con panel
   desplegable, búsqueda que filtra de verdad y carrito con contador. */
export default function Masthead() {
  const { settings, products, totals, user, cartOpen, setCartOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const location = useLocation();
  const brand = settings?.brand?.name || 'Aurora Desayunos';

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!megaOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMegaOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [megaOpen]);

  return (
    <>
      {settings?.banner?.active && (
        <div className="tile-dark grain relative border-0">
          <div className="wrap relative py-2 text-center text-xs tracking-wide">
            {settings.banner.text}
          </div>
        </div>
      )}

      <header
        className="sticky top-0 border-b bg-paper"
        style={{ zIndex: 'var(--z-sticky)', borderColor: 'var(--color-ink)', borderBottomWidth: 'var(--rule-firm)' }}
      >
        <div className="wrap flex items-center gap-3 py-3">
          <Link to="/" className="font-display text-xl leading-none tracking-tight nowrap md:text-2xl">
            {brand.split(' ')[0]}
            <span className="hidden md:inline"> {brand.split(' ').slice(1).join(' ')}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            <button
              type="button"
              className="pill border-transparent"
              aria-expanded={megaOpen}
              aria-controls="mega"
              onClick={() => setMegaOpen((v) => !v)}
            >
              Desayunos
              <span aria-hidden="true" className="text-xs">
                {megaOpen ? '▲' : '▼'}
              </span>
            </button>
            <NavLink to="/diario" className="pill border-transparent">
              Diario
            </NavLink>
            <NavLink to="/pedido" className="pill border-transparent">
              Seguir pedido
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block">
              <SearchBox products={products} />
            </div>
            <Link to="/cuenta" className="btn btn-ghost hidden nowrap lg:inline-flex">
              {user ? user.name.split(' ')[0] : 'Ingresar'}
            </Link>
            <CartButton count={totals.count} amount={totals.total} onClick={() => setCartOpen(true)} />
            <button
              type="button"
              className="btn btn-ghost px-3 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? 'Cerrar' : 'Menú'}
            </button>
          </div>
        </div>

        {/* En móvil la búsqueda baja a su propia fila: en la barra superior
            competía con el carrito y el menú y se salía de la pantalla. */}
        <div className="wrap pb-3 md:hidden">
          <SearchBox products={products} fullWidth />
        </div>

        {/* Panel de categorías con una foto por sección */}
        {megaOpen && (
          <div id="mega" className="hidden border-t border-rule bg-paper-2 lg:block">
            <div className="wrap grid grid-cols-3 gap-6 py-7">
              <div className="col-span-2 grid grid-cols-3 gap-x-6 gap-y-2">
                {[...new Set(products.map((p) => p.category))].map((category) => (
                  <div key={category}>
                    <p className="mb-1.5 text-xs uppercase tracking-widest text-muted">
                      {categoryLabel(category)}
                    </p>
                    <ul className="space-y-1">
                      {products
                        .filter((p) => p.category === category)
                        .map((p) => (
                          <li key={p.id}>
                            <Link to={`/desayunos/${p.slug}`} className="link text-sm">
                              {p.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
              <MegaFeature products={products} />
            </div>
          </div>
        )}

        {menuOpen && (
          <nav id="menu-movil" className="border-t border-rule lg:hidden" aria-label="Principal móvil">
            <ul className="wrap flex flex-col py-1">
              {[
                { to: '/desayunos', label: 'Todos los desayunos' },
                { to: '/diario', label: 'Diario' },
                { to: '/pedido', label: 'Seguir pedido' },
                { to: '/cuenta', label: user ? 'Mi cuenta' : 'Ingresar' },
              ].map((l) => (
                <li key={l.to} className="border-b border-rule last:border-0">
                  <NavLink to={l.to} className="block py-3 nowrap">
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="wrap flex flex-wrap gap-2 pb-4">
              {[...new Set(products.map((p) => p.category))].map((category) => (
                <Link key={category} to={`/desayunos?c=${category}`} className="pill">
                  {categoryLabel(category)}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

/** Pieza destacada del mega-menú: el desayuno más vendido de verdad. */
function MegaFeature({ products }) {
  const top = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0))[0];
  if (!top) return null;
  return (
    <Link to={`/desayunos/${top.slug}`} className="tile grain group block">
      <div className="aspect-16/10 overflow-hidden">
        <img
          src={top.images[0]}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-4">
        <p className="chip chip-accent">Más pedido</p>
        <p className="mt-2 font-display text-lg leading-tight">{top.name}</p>
        <p className="nums mt-0.5 text-sm text-muted">Desde {money(top.price)}</p>
      </div>
    </Link>
  );
}

/** Búsqueda con sugerencias: filtra sobre la carta ya cargada, sin ida al servidor. */
function SearchBox({ products, fullWidth = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onClick);
    return () => document.removeEventListener('pointerdown', onClick);
  }, []);

  const normalized = query.trim().toLowerCase();
  const matches = normalized
    ? products
        .filter((p) =>
          `${p.name} ${p.tagline} ${categoryLabel(p.category)}`.toLowerCase().includes(normalized),
        )
        .slice(0, 5)
    : [];

  return (
    <div ref={boxRef} className={fullWidth ? 'relative' : 'relative shrink-0'}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (matches[0]) navigate(`/desayunos/${matches[0].slug}`);
          else navigate(`/desayunos?q=${encodeURIComponent(query)}`);
          setOpen(false);
        }}
      >
        <label className="sr-only" htmlFor={listId}>
          Buscar un desayuno
        </label>
        <input
          id={listId}
          className={`input rounded-pill py-1.5 pl-3.5 ${
            fullWidth ? 'w-full' : 'w-44 transition-[width] duration-200 lg:w-56 lg:focus:w-72'
          }`}
          type="search"
          value={query}
          placeholder="Buscar…"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </form>

      {open && matches.length > 0 && (
        <ul
          className="tile absolute right-0 top-full mt-2 w-72 p-1"
          style={{ zIndex: 'var(--z-overlay)' }}
        >
          {matches.map((p) => (
            <li key={p.id}>
              <Link
                to={`/desayunos/${p.slug}`}
                className="flex items-center gap-3 rounded-sm p-2 hover:bg-paper-2"
                onClick={() => setOpen(false)}
              >
                <img src={p.images[0]} alt="" width="36" height="36" className="h-9 w-9 rounded-sm object-cover" />
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <span className="nums shrink-0 text-sm text-muted">{money(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CartButton({ count, amount, onClick }) {
  return (
    <button
      type="button"
      className="btn btn-ink nowrap px-3"
      onClick={onClick}
      aria-label={`Carrito, ${count} ${count === 1 ? 'caja' : 'cajas'}`}
    >
      <BagMark />
      {/* El monto sólo desde md: en móvil «$ 142.000» empujaba el menú
          fuera de la pantalla. Ahí va el número de cajas. */}
      <span className="nums hidden md:inline">{count > 0 ? money(amount) : count}</span>
      <span className="nums md:hidden">{count}</span>
    </button>
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
