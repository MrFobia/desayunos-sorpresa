import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap py-24">
      <h1 style={{ fontSize: 'var(--text-display-s)' }}>Acá no hay desayuno.</h1>
      <p className="measure mt-4 text-md text-muted">
        La página que buscabas no existe o cambió de dirección.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
        <Link to="/desayunos" className="btn btn-ghost">
          Ver la carta
        </Link>
      </div>
    </div>
  );
}
