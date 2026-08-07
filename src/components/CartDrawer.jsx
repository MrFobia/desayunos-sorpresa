import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { money, prettyDate } from '../lib/format.js';

export default function CartDrawer({ open, onClose }) {
  const { cart, addons, totals, removeFromCart, setQty, user, settings } = useStore();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const addonName = (id) => addons.find((a) => a.id === id)?.name || '';
  const addonPrice = (id) => addons.find((a) => a.id === id)?.price || 0;

  return (
    <div className="fixed inset-0" style={{ zIndex: 'var(--z-modal)' }}>
      <button
        type="button"
        aria-label="Cerrar el carrito"
        onClick={onClose}
        className="absolute inset-0 bg-ink-deep/40"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h2 className="text-lg">Tu carrito</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-muted">Todavía no hay desayunos acá.</p>
            <Link to="/desayunos" className="btn btn-primary" onClick={onClose}>
              Ver la carta
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-rule overflow-y-auto">
              {cart.map((line) => (
                <li key={line.lineId} className="flex gap-3 px-5 py-4">
                  <img
                    src={line.image}
                    alt=""
                    width="72"
                    height="90"
                    loading="lazy"
                    className="h-[90px] w-[72px] shrink-0 rounded-sm object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-display text-base leading-tight">{line.name}</p>
                      <span className="nums shrink-0 text-sm">
                        {money((line.price + (line.addons || []).reduce((s, id) => s + addonPrice(id), 0)) * line.qty)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {prettyDate(line.delivery?.date)} · {line.delivery?.slot}
                    </p>
                    {(line.addons || []).length > 0 && (
                      <p className="mt-1 text-xs text-muted">
                        Con {line.addons.map(addonName).join(', ')}
                      </p>
                    )}
                    {(line.removed || []).length > 0 && (
                      <p className="mt-1 text-xs text-muted">Sin {line.removed.join(', ')}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-pill border border-rule">
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          aria-label={`Quitar una unidad de ${line.name}`}
                          onClick={() => setQty(line.lineId, line.qty - 1)}
                        >
                          −
                        </button>
                        <span className="nums w-6 text-center text-sm">{line.qty}</span>
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          aria-label={`Agregar una unidad de ${line.name}`}
                          onClick={() => setQty(line.lineId, line.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-quiet text-xs"
                        onClick={() => removeFromCart(line.lineId)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-rule px-5 py-4">
              <dl className="space-y-1 text-sm">
                <Row label="Subtotal" value={money(totals.subtotal)} />
                {totals.discount > 0 && (
                  <Row
                    label={`Primer pedido −${settings?.discountFirstOrder} %`}
                    value={`− ${money(totals.discount)}`}
                    accent
                  />
                )}
                <Row
                  label="Domicilio"
                  value={totals.deliveryFee === 0 ? 'Gratis' : money(totals.deliveryFee)}
                />
              </dl>
              <div className="mt-3 flex items-baseline justify-between border-t border-rule pt-3">
                <span className="font-display text-lg">Total</span>
                <span className="nums font-display text-lg">{money(totals.total)}</span>
              </div>
              {!user && (
                <p className="mt-2 text-xs text-muted">
                  <Link to="/cuenta" className="link" onClick={onClose}>
                    Creá una cuenta
                  </Link>{' '}
                  y tu primer pedido lleva {settings?.discountFirstOrder} % menos.
                </p>
              )}
              <Link to="/checkout" className="btn btn-primary mt-4 w-full" onClick={onClose}>
                Ir a pagar
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <dt className={accent ? 'text-accent' : 'text-muted'}>{label}</dt>
      <dd className={`nums ${accent ? 'text-accent' : ''}`}>{value}</dd>
    </div>
  );
}
