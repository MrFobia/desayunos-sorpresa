import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { api } from '../lib/api.js';
import { money, prettyDate } from '../lib/format.js';

const emptyCustomer = { name: '', phone: '', email: '', address: '', city: '', notes: '' };

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, addons, totals, settings, user, setUser, clearCart, removeFromCart } = useStore();
  const [customer, setCustomer] = useState({ ...emptyCustomer, name: user?.name || '', email: user?.email || '' });
  const [mode, setMode] = useState(user ? 'cuenta' : 'invitado'); // invitado | cuenta
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const addonPrice = (id) => addons.find((a) => a.id === id)?.price || 0;
  const addonName = (id) => addons.find((a) => a.id === id)?.name || '';
  const set = (key) => (e) => setCustomer((c) => ({ ...c, [key]: e.target.value }));

  if (cart.length === 0) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-3xl">El carrito está vacío</h1>
        <p className="mt-3 text-muted">Elegí un desayuno y volvé por acá.</p>
        <Link to="/desayunos" className="btn btn-primary mt-6">
          Ver la carta
        </Link>
      </div>
    );
  }

  async function handleAuth(event) {
    event.preventDefault();
    setAuthError('');
    try {
      const isNew = mode === 'registro';
      const payload = isNew
        ? { name: customer.name || 'Cliente', email: credentials.email, password: credentials.password }
        : { email: credentials.email, password: credentials.password };
      const result = isNew ? await api.register(payload) : await api.login(payload);
      setUser(result.user);
      setCustomer((c) => ({ ...c, email: result.user.email, name: c.name || result.user.name }));
      setMode('cuenta');
    } catch (e) {
      setAuthError(e.message);
    }
  }

  async function submitOrder(event) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const order = await api.createOrder({
        userId: user?.id || null,
        customer,
        items: cart.map((line) => ({
          productId: line.productId,
          qty: line.qty,
          addons: line.addons,
          removed: line.removed,
          delivery: line.delivery,
          recipient: line.recipient,
          message: line.message,
        })),
      });
      clearCart();
      if (user) setUser({ ...user, firstOrderUsed: true });
      navigate(`/gracias/${order.code}`, { state: { order } });
    } catch (e) {
      setError(e.message);
      setSending(false);
    }
  }

  return (
    <div className="wrap py-12">
      <h1 className="text-4xl">Confirmá el pedido</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        {/* ------------------------------------------------------ formulario */}
        <form onSubmit={submitOrder}>
          {!user && (
            <section className="rounded-sm border border-rule bg-paper-2 p-5">
              <h2 className="text-lg">¿Con cuenta o sin cuenta?</h2>
              <p className="mt-1 text-sm text-muted">
                Podés pedir sin registrarte. Si creás una cuenta, tu primer pedido lleva{' '}
                {settings?.discountFirstOrder} % menos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: 'invitado', label: 'Seguir sin cuenta' },
                  { id: 'registro', label: `Crear cuenta (−${settings?.discountFirstOrder} %)` },
                  { id: 'ingreso', label: 'Ya tengo cuenta' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={mode === option.id}
                    onClick={() => setMode(option.id)}
                    className="rounded-pill border px-3.5 py-1.5 text-sm nowrap"
                    style={{
                      borderColor: mode === option.id ? 'var(--color-ink)' : 'var(--color-rule)',
                      background: mode === option.id ? 'var(--color-ink)' : 'transparent',
                      color: mode === option.id ? 'var(--color-paper)' : 'var(--color-ink)',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {(mode === 'registro' || mode === 'ingreso') && (
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="field">
                    <span>Correo</span>
                    <input
                      className="input"
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Contraseña</span>
                    <input
                      className="input"
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    />
                  </label>
                  <button type="button" className="btn btn-ghost nowrap" onClick={handleAuth}>
                    {mode === 'registro' ? 'Crear cuenta' : 'Entrar'}
                  </button>
                  {authError && (
                    <p className="text-sm sm:col-span-3" style={{ color: 'var(--color-accent)' }} role="alert">
                      {authError}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {user && (
            <p className="rounded-sm border border-rule bg-paper-2 p-4 text-sm">
              Entrando como <strong>{user.name}</strong>.{' '}
              {!user.firstOrderUsed && (
                <span style={{ color: 'var(--color-accent)' }}>
                  Tu primer pedido lleva {settings?.discountFirstOrder} % de descuento.
                </span>
              )}
            </p>
          )}

          <h2 className="mt-10 text-xl">Datos de entrega</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span>Tu nombre *</span>
              <input className="input" required value={customer.name} onChange={set('name')} />
            </label>
            <label className="field">
              <span>Celular *</span>
              <input
                className="input"
                required
                type="tel"
                inputMode="tel"
                value={customer.phone}
                onChange={set('phone')}
              />
            </label>
            <label className="field sm:col-span-2">
              <span>Correo</span>
              <input className="input" type="email" value={customer.email} onChange={set('email')} />
            </label>
            <label className="field sm:col-span-2">
              <span>Dirección de entrega *</span>
              <input
                className="input"
                required
                value={customer.address}
                placeholder="Calle, número, apartamento, conjunto"
                onChange={set('address')}
              />
            </label>
            <label className="field">
              <span>Ciudad</span>
              <select className="input" value={customer.city} onChange={set('city')}>
                <option value="">Elegí</option>
                {settings?.delivery?.cities?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="field sm:col-span-2">
              <span>Indicaciones para el domiciliario</span>
              <textarea
                className="input"
                rows={2}
                value={customer.notes}
                placeholder="Torre 3, timbre 402. No llamar antes de las 6."
                onChange={set('notes')}
              />
            </label>
          </div>

          <p className="mt-6 text-sm text-muted">
            Pago contra entrega o por transferencia. Te escribimos por WhatsApp para coordinarlo.
          </p>

          {error && (
            <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto" disabled={sending}>
            {sending ? 'Enviando…' : `Confirmar pedido · ${money(totals.total)}`}
          </button>
        </form>

        {/* --------------------------------------------------------- resumen */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-xl">Tu pedido</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {cart.map((line) => (
              <li key={line.lineId} className="flex gap-3 py-4">
                <img
                  src={line.image}
                  alt=""
                  loading="lazy"
                  width="64"
                  height="80"
                  className="h-20 w-16 shrink-0 rounded-sm object-cover"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <p className="font-display text-base leading-tight">
                      {line.name} {line.qty > 1 && <span className="nums text-muted">× {line.qty}</span>}
                    </p>
                    <span className="nums shrink-0">
                      {money((line.price + line.addons.reduce((s, id) => s + addonPrice(id), 0)) * line.qty)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted">
                    {prettyDate(line.delivery.date)} · {line.delivery.slot}
                  </p>
                  {line.addons.length > 0 && (
                    <p className="mt-0.5 text-muted">Con {line.addons.map(addonName).join(', ')}</p>
                  )}
                  {line.removed.length > 0 && (
                    <p className="mt-0.5 text-muted">Sin {line.removed.join(', ')}</p>
                  )}
                  {line.message && <p className="mt-0.5 text-muted">Tarjeta: «{line.message}»</p>}
                  <button
                    type="button"
                    className="btn btn-quiet mt-1 text-xs"
                    onClick={() => removeFromCart(line.lineId)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="nums">{money(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--color-accent)' }}>
                <dt>Primer pedido −{settings?.discountFirstOrder} %</dt>
                <dd className="nums">− {money(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Domicilio</dt>
              <dd className="nums">{totals.deliveryFee === 0 ? 'Gratis' : money(totals.deliveryFee)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-rule pt-3">
            <span className="font-display text-xl">Total</span>
            <span className="nums font-display text-xl">{money(totals.total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
