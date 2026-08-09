import { useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import CatalogGrid from '../components/CatalogGrid.jsx';
import { categoryLabel } from '../lib/format.js';

export default function Catalog() {
  const { products, loading } = useStore();
  const [params] = useSearchParams();
  const category = params.get('c');

  return (
    <div className="wrap py-10 md:py-16">
      <header className="max-w-2xl">
        <p className="label">La carta</p>
        <h1 className="mt-3" style={{ fontSize: 'var(--text-display-s)' }}>
          {category ? categoryLabel(category) : 'Ocho cajas, ocho mañanas'}
        </h1>
        <p className="measure mt-4 text-md text-muted">
          {category
            ? `Los desayunos de la categoría ${categoryLabel(category).toLowerCase()}.`
            : 'Quita lo que no va, suma adicionales y elige el día y la hora en que llega.'}
        </p>
      </header>

      <div className="mt-10 md:mt-14">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4" aria-busy="true">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="shot aspect-3/4" />
            ))}
          </div>
        ) : (
          <CatalogGrid products={products} />
        )}
      </div>
    </div>
  );
}
