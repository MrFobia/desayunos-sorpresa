import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import OrderDetail from '../components/OrderDetail.jsx';

export default function OrderLookup() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(code || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(code));

  useEffect(() => {
    if (!code) {
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .order(code)
      .then((data) => {
        setOrder(data);
        setError('');
      })
      .catch((e) => {
        setOrder(null);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="wrap py-14">
      <h1 className="text-4xl">Seguir un pedido</h1>
      <p className="measure mt-3 text-muted">
        Escribí el código que te dimos al confirmar. Tiene la forma AUR-XXXXXX.
      </p>

      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/pedido/${input.trim().toUpperCase()}`);
        }}
      >
        <label className="field w-full sm:max-w-xs">
          <span>Código del pedido</span>
          <input
            className="input nums"
            value={input}
            placeholder="AUR-1A2B3C"
            aria-invalid={Boolean(error)}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <button className="btn btn-primary nowrap">Buscar</button>
      </form>

      {loading && <p className="mt-8 text-muted">Buscando…</p>}
      {error && !loading && (
        <p className="mt-8 text-sm" style={{ color: 'var(--color-accent)' }} role="alert">
          {error}
        </p>
      )}
      {order && !loading && (
        <div className="mt-12">
          <OrderDetail order={order} />
        </div>
      )}
    </div>
  );
}
