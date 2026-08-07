import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { prettyDate } from '../lib/format.js';
import OrderDetail from '../components/OrderDetail.jsx';

export default function ThankYou() {
  const { code } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) return;
    api.order(code).then(setOrder).catch((e) => setError(e.message));
  }, [code, order]);

  if (error) {
    return (
      <div className="wrap py-24">
        <h1 className="text-3xl">No encontramos ese pedido</h1>
        <p className="mt-3 text-muted">{error}</p>
        <Link to="/" className="btn btn-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="wrap py-24 text-muted">Buscando tu pedido…</div>;
  }

  const first = order.items[0];

  return (
    <div className="wrap py-8 md:py-12">
      <div className="tile tile-dark grain px-6 py-8 md:px-8 md:py-10">
        <span className="chip chip-solid">Pedido confirmado</span>
        <h1 className="mt-4" style={{ fontSize: 'var(--text-display-s)' }}>
          Gracias, {order.customer.name.split(' ')[0]}.
        </h1>
        <p className="measure mt-4 opacity-85">
          Guardá el código{' '}
          <strong className="nums" style={{ color: 'var(--color-paper)' }}>
            {order.code}
          </strong>
          . Con él podés ver el estado del pedido cuando quieras. Te escribimos por WhatsApp al{' '}
          {order.customer.phone} para confirmar el pago y la entrega.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/pedido/${order.code}`} className="btn btn-primary">
            Ver mi pedido
          </Link>
          <Link
            to="/desayunos"
            className="btn btn-ghost"
            style={{ color: 'var(--color-paper)', borderColor: 'var(--color-espresso-2)' }}
          >
            Seguir viendo la carta
          </Link>
        </div>
      </div>

      {first && (
        <p className="tile mt-4 p-4 text-sm" style={{ background: 'var(--color-yolk)' }}>
          Lo primero que sale de la cocina: <strong>{first.name}</strong>, el{' '}
          {prettyDate(first.delivery.date)} en la franja {first.delivery.slot}.
        </p>
      )}

      <div className="mt-10">
        <OrderDetail order={order} />
      </div>
    </div>
  );
}
