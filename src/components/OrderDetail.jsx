import { money, prettyDate } from '../lib/format.js';

const STEPS = ['recibido', 'en preparación', 'en camino', 'entregado'];

export default function OrderDetail({ order }) {
  const current = Math.max(0, STEPS.indexOf(order.status));

  return (
    <section className="panel p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
        <h2 className="text-xl">
          Pedido <span className="nums">{order.code}</span>
        </h2>
        <p className="text-sm text-muted">{prettyDate(order.createdAt)}</p>
      </div>

      {order.status === 'cancelado' ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }}>
          Este pedido está cancelado. Si es un error, escribinos por WhatsApp.
        </p>
      ) : (
        <ol className="mt-5 grid gap-2 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step}>
              <div
                className="h-1 rounded-pill"
                style={{ background: i <= current ? 'var(--color-accent)' : 'var(--color-rule)' }}
              />
              <p
                className="mt-2 text-sm first-letter:uppercase"
                style={{ color: i <= current ? 'var(--color-ink)' : 'var(--color-neutral)' }}
              >
                {step}
              </p>
            </li>
          ))}
        </ol>
      )}

      <ul className="mt-8 divide-y divide-rule border-y border-rule">
        {order.items.map((item, i) => (
          <li key={i} className="flex gap-4 py-4">
            <img
              src={item.image}
              alt=""
              loading="lazy"
              width="80"
              height="100"
              className="h-[100px] w-20 shrink-0 rounded-sm object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3">
                <p className="font-display text-lg leading-tight">
                  {item.name} {item.qty > 1 && <span className="nums text-muted">× {item.qty}</span>}
                </p>
                <span className="nums shrink-0">{money(item.lineTotal)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">
                Entrega el {prettyDate(item.delivery.date)} · {item.delivery.slot}
              </p>
              {item.recipient?.name && (
                <p className="text-sm text-muted">Para {item.recipient.name}</p>
              )}
              {item.addons.length > 0 && (
                <p className="text-sm text-muted">
                  Con {item.addons.map((a) => a.name).join(', ')}
                </p>
              )}
              {item.removed.length > 0 && (
                <p className="text-sm text-muted">Sin {item.removed.join(', ')}</p>
              )}
              {item.message && <p className="mt-1 text-sm">Tarjeta: «{item.message}»</p>}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-8 sm:grid-cols-2">
        <div className="text-sm">
          <h3 className="text-base">Entrega</h3>
          <p className="mt-1 text-muted">
            {order.customer.name} · {order.customer.phone}
            <br />
            {order.customer.address}
            {order.customer.city ? `, ${order.customer.city}` : ''}
            {order.customer.notes ? <><br />{order.customer.notes}</> : null}
          </p>
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="nums">{money(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between" style={{ color: 'var(--color-accent)' }}>
              <dt>{order.discountLabel}</dt>
              <dd className="nums">− {money(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Domicilio</dt>
            <dd className="nums">{order.deliveryFee === 0 ? 'Gratis' : money(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-rule pt-2">
            <dt className="font-display text-lg">Total</dt>
            <dd className="nums font-display text-lg">{money(order.total)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
