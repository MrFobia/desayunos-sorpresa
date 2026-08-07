import { useMemo, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { categoryLabel, money } from '../lib/format.js';

const PRICE_BANDS = [
  { id: 'all', label: 'Todos los precios', test: () => true },
  { id: 'lo', label: 'Hasta $60.000', test: (p) => p.price <= 60000 },
  { id: 'mid', label: '$60.000 – $85.000', test: (p) => p.price > 60000 && p.price <= 85000 },
  { id: 'hi', label: 'Más de $85.000', test: (p) => p.price > 85000 },
];

const SERVES = [
  { id: 'all', label: 'Cualquier tamaño', test: () => true },
  { id: '1', label: 'Para una persona', test: (p) => p.serves === 1 },
  { id: '2', label: 'Para dos o más', test: (p) => p.serves >= 2 },
];

const SORTS = {
  destacados: (a, b) => Number(b.featured) - Number(a.featured) || a.price - b.price,
  precioAsc: (a, b) => a.price - b.price,
  precioDesc: (a, b) => b.price - a.price,
  nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
};

export default function CatalogGrid({ products, limit, showFilters = true }) {
  const [category, setCategory] = useState('all');
  const [band, setBand] = useState('all');
  const [serves, setServes] = useState('all');
  const [sort, setSort] = useState('destacados');

  const categories = useMemo(() => {
    const seen = [...new Set(products.map((p) => p.category))];
    return [{ id: 'all', label: 'Todo' }, ...seen.map((id) => ({ id, label: categoryLabel(id) }))];
  }, [products]);

  const filtered = useMemo(() => {
    const bandTest = PRICE_BANDS.find((b) => b.id === band).test;
    const servesTest = SERVES.find((s) => s.id === serves).test;
    const list = products
      .filter((p) => (category === 'all' ? true : p.category === category))
      .filter(bandTest)
      .filter(servesTest)
      .sort(SORTS[sort]);
    return limit ? list.slice(0, limit) : list;
  }, [products, category, band, serves, sort, limit]);

  const cheapest = useMemo(
    () => (products.length ? Math.min(...products.map((p) => p.price)) : 0),
    [products],
  );

  return (
    <div>
      {showFilters && (
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                className="rounded-pill border px-3.5 py-1.5 text-sm nowrap transition-colors duration-150"
                style={{
                  borderColor: category === c.id ? 'var(--color-ink)' : 'var(--color-rule)',
                  background: category === c.id ? 'var(--color-ink)' : 'transparent',
                  color: category === c.id ? 'var(--color-paper)' : 'var(--color-ink)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* En móvil los tres selectores van en rejilla: apilados empujaban la
              primera fila de productos fuera de la pantalla. */}
          <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
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
                <option value="destacados">Destacados</option>
                <option value="precioAsc">Precio: de menor a mayor</option>
                <option value="precioDesc">Precio: de mayor a menor</option>
                <option value="nombre">Nombre</option>
              </select>
            </label>
            <p className="nums col-span-2 pb-2 text-sm text-muted sm:col-span-1" role="status">
              {filtered.length} {filtered.length === 1 ? 'desayuno' : 'desayunos'} · desde {money(cheapest)}
            </p>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="border-t border-rule py-16 text-center">
          <p className="text-muted">Con esos filtros no queda nada. Probá con otro precio o tamaño.</p>
          <button
            type="button"
            className="btn btn-ghost mt-4"
            onClick={() => {
              setCategory('all');
              setBand('all');
              setServes('all');
            }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              emphasis={i % 3 === 0}
              priority={i < 2}
            />
          ))}
        </div>
      )}
    </div>
  );
}
