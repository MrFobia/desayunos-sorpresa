import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api.js';
import { money, prettyDate } from '../lib/format.js';

const STATUSES = ['recibido', 'en preparación', 'en camino', 'entregado', 'cancelado'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [open, setOpen] = useState(null);

  const load = () =>
    adminApi
      .list('orders')
      .then((data) => {
        setOrders(data);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    // actualización optimista: el estado cambia ya y se revierte si el PUT falla
    const previous = orders;
    setOrders((current) => current.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await adminApi.update('orders', id, { status });
    } catch (e) {
      setOrders(previous);
      setError(e.message);
    }
  }

  if (loading) return <p className="text-muted">Cargando pedidos…</p>;

  const visible = filter === 'todos' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-3xl">Pedidos</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        {['todos', ...STATUSES].map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
            className="rounded-pill border px-3 py-1 text-sm nowrap first-letter:uppercase"
            style={{
              borderColor: filter === status ? 'var(--color-ink)' : 'var(--color-rule)',
              background: filter === status ? 'var(--color-ink)' : 'transparent',
              color: filter === status ? 'var(--color-paper)' : 'var(--color-ink)',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }} role="alert">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 text-muted">Todavía no hay pedidos con ese estado.</p>
      ) : (
        <ul className="mt-8 divide-y divide-rule border-y border-rule">
          {visible.map((order) => (
            <li key={order.id} className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="nums font-display text-lg leading-tight">{order.code}</p>
                  <p className="text-sm text-muted">
                    {order.customer.name} · {order.customer.phone} ·{' '}
                    {order.items.length === 1 ? '1 caja' : `${order.items.length} cajas`} ·{' '}
                    {prettyDate(order.createdAt)}
                    {order.guest ? ' · invitado' : ''}
                  </p>
                </div>
                <p className="nums">{money(order.total)}</p>
                <select
                  className="input max-w-44"
                  value={order.status}
                  aria-label={`Estado del pedido ${order.code}`}
                  onChange={(e) => setStatus(order.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-ghost nowrap"
                  aria-expanded={open === order.id}
                  onClick={() => setOpen(open === order.id ? null : order.id)}
                >
                  {open === order.id ? 'Ocultar' : 'Detalle'}
                </button>
              </div>

              {open === order.id && (
                <div className="mt-4 grid gap-6 rounded-sm bg-paper-2 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <h3 className="text-base">Entrega</h3>
                    <p className="mt-1 text-muted">
                      {order.customer.address}
                      {order.customer.city ? `, ${order.customer.city}` : ''}
                      {order.customer.email ? <><br />{order.customer.email}</> : null}
                      {order.customer.notes ? <><br />{order.customer.notes}</> : null}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base">Cajas</h3>
                    <ul className="mt-1 space-y-2 text-muted">
                      {order.items.map((item, i) => (
                        <li key={i}>
                          <strong className="text-ink">
                            {item.name} × {item.qty}
                          </strong>
                          <br />
                          {prettyDate(item.delivery.date)} · {item.delivery.slot}
                          {item.addons.length > 0 && <><br />Con {item.addons.map((a) => a.name).join(', ')}</>}
                          {item.removed.length > 0 && <><br />Sin {item.removed.join(', ')}</>}
                          {item.message && <><br />Tarjeta: «{item.message}»</>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
