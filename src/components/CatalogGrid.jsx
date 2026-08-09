import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import { categoryLabel, money } from '../lib/format.js';

/* Etiquetas cortas: el ancho del `select` en móvil recorta las largas. */
const PRICE_BANDS = [
  { id: 'all', label: 'Cualquiera', test: () => true },
  { id: 'lo', label: 'Hasta $60.000', test: (p) => p.price <= 60000 },
  { id: 'mid', label: '$60 – $85.000', test: (p) => p.price > 60000 && p.price <= 85000 },
  { id: 'hi', label: 'Más de $85.000', test: (p) => p.price > 85000 },
];

const SERVES = [
  { id: 'all', label: 'Cualquiera', test: () => true },
  { id: '1', label: 'Una persona', test: (p) => p.serves === 1 },
  { id: '2', label: 'Dos o más', test: (p) => p.serves >= 2 },
];

const SORTS = {
  destacados: (a, b) => b.sold - a.sold || Number(b.featured) - Number(a.featured) || a.price - b.price,
  precioAsc: (a, b) => a.price - b.price,
  precioDesc: (a, b) => b.price - a.price,
  nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
};

/**
 * Grilla del catálogo con filtros. La categoría y la búsqueda viajan en la
 * URL (`?c=` y `?q=`) para que el mega-menú y el buscador puedan enlazar
 * directo a un estado filtrado y el usuario pueda compartirlo.
 */
export default function CatalogGrid({ products, limit, showFilters = true }) {
  const [params, setParams] = useSearchParams();
  const category = params.get('c') || 'all';
  const query = params.get('q') || '';

  const [band, setBand] = useState('all');
  const [serves, setServes] = useState('all');
  const [sort, setSort] = useState('destacados');
  const [onlyOffers, setOnlyOffers] = useState(false);

  useEffect(() => {
    // Al llegar desde el buscador con ?q=, no arrastres un filtro previo.
    if (query) {
      setBand('all');
      setServes('all');
    }
  }, [query]);

  const setCategory = (value) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('c');
    else next.set('c', value);
    next.delete('q');
    setParams(next, { replace: true });
  };

  const categories = useMemo(() => {
    const seen = [...new Set(products.map((p) => p.category))];
    return [{ id: 'all', label: 'Todo' }, ...seen.map((id) => ({ id, label: categoryLabel(id) }))];
  }, [products]);

  const filtered = useMemo(() => {
    const bandTest = PRICE_BANDS.find((b) => b.id === band).test;
    const servesTest = SERVES.find((s) => s.id === serves).test;
    const needle = query.trim().toLowerCase();
    const list = products
      .filter((p) => (category === 'all' ? true : p.category === category))
      .filter((p) =>
        needle ? `${p.name} ${p.tagline}`.toLowerCase().includes(needle) : true,
      )
      .filter((p) => (onlyOffers ? p.compareAt && p.compareAt > p.price : true))
      .filter(bandTest)
      .filter(servesTest)
      .sort(SORTS[sort]);
    return limit ? list.slice(0, limit) : list;
  }, [products, category, query, onlyOffers, band, serves, sort, limit]);

  const cheapest = useMemo(
    () => (products.length ? Math.min(...products.map((p) => p.price)) : 0),
    [products],
  );

  const clearAll = () => {
    setBand('all');
    setServes('all');
    setOnlyOffers(false);
    setParams(new URLSearchParams(), { replace: true });
  };

  const dirty = category !== 'all' || query || band !== 'all' || serves !== 'all' || onlyOffers;

  return (
    <div>
      {showFilters && (
        <div className="mb-6">
          {/* Filtros tipográficos con subrayado, en una fila desplazable.
              Las cápsulas rellenas de la versión anterior competían con la
              fotografía y pesaban más que los productos. */}
          <div
            className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
            role="group"
            aria-label="Filtrar por tipo"
          >
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className="filter"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
            <button
              type="button"
              className="filter"
              aria-pressed={onlyOffers}
              onClick={() => setOnlyOffers((v) => !v)}
            >
              En oferta
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
            <label className="field">
              <span>Precio</span>
              <select className="input" value={band} onChange={(e) => setBand(e.target.value)}>
                {PRICE_BANDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tamaño</span>
              <select className="input" value={serves} onChange={(e) => setServes(e.target.value)}>
                {SERVES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Ordenar</span>
              <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="destacados">Más pedidos</option>
                <option value="precioAsc">Precio: de menor a mayor</option>
                <option value="precioDesc">Precio: de mayor a menor</option>
                <option value="nombre">Nombre</option>
              </select>
            </label>

            <p className="nums col-span-2 flex items-center gap-3 pb-2 text-sm text-muted sm:col-span-1" role="status">
              {filtered.length} {filtered.length === 1 ? 'desayuno' : 'desayunos'} · desde {money(cheapest)}
              {dirty && (
                <button type="button" className="btn btn-quiet text-sm" onClick={clearAll}>
                  Limpiar
                </button>
              )}
            </p>
          </div>

          {query && (
            <p className="mt-3 text-sm text-muted">
              Resultados para <strong className="text-ink">«{query}»</strong>.
            </p>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-muted">Con esos filtros no queda nada. Prueba con otro precio o tamaño.</p>
          <button type="button" className="btn btn-ghost mt-4" onClick={clearAll}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
