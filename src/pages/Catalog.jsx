import { useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import CatalogGrid from '../components/CatalogGrid.jsx';
import { categoryLabel } from '../lib/format.js';

export default function Catalog() {
  const { products, loading } = useStore();
  const [params] = useSearchParams();
  const category = params.get('c');

  return (
    <div className="wrap py-8 md:py-12">
      <div className="tile tile-dark grain relative px-6 py-8 md:px-8 md:py-10">
        <h1 className="text-3xl md:text-4xl">
          {category ? categoryLabel(category) : 'La carta'}
        </h1>
        <p className="measure mt-2 opacity-85">
          {category
            ? `Los desayunos de la categoría ${categoryLabel(category).toLowerCase()}.`
            : 'Ocho desayunos. Quitá lo que no va, sumá adicionales y elegí día y hora.'}
        </p>
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="aspect-3/4 rounded-lg" style={{ background: 'var(--color-paper-3)' }} />
            ))}
          </div>
        ) : (
          <CatalogGrid products={products} />
        )}
      </div>
    </div>
  );
}
