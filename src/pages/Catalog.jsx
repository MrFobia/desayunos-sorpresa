import { useStore } from '../lib/store.jsx';
import CatalogGrid from '../components/CatalogGrid.jsx';

export default function Catalog() {
  const { products, loading } = useStore();

  return (
    <div className="wrap py-8 md:py-16">
      <h1 className="text-3xl md:text-4xl">La carta</h1>
      <p className="measure mt-2 text-muted">
        Ocho desayunos. Quitá lo que no va, sumá adicionales y elegí día y hora.
      </p>

      <div className="mt-7 md:mt-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-3/4 rounded-sm" style={{ background: 'var(--color-paper-3)' }} />
            ))}
          </div>
        ) : (
          <CatalogGrid products={products} />
        )}
      </div>
    </div>
  );
}
