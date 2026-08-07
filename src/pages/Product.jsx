import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { money, minDeliveryDate, prettyDate, categoryLabel } from '../lib/format.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, addons, settings, addToCart, loading } = useStore();

  const product = products.find((p) => p.slug === slug);

  const [activeImage, setActiveImage] = useState(0);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [removed, setRemoved] = useState([]);
  const [chosenAddons, setChosenAddons] = useState([]);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState({ name: '', phone: '' });
  const [qty, setQty] = useState(1);
  const [touched, setTouched] = useState(false);
  const [added, setAdded] = useState(false);
  const configRef = useRef(null);

  const minDate = minDeliveryDate(settings?.delivery?.minLeadDays ?? 1);

  useEffect(() => {
    setActiveImage(0);
    setRemoved([]);
    setChosenAddons([]);
    setAdded(false);
  }, [slug]);

  const total = useMemo(() => {
    if (!product) return 0;
    const extras = chosenAddons.reduce(
      (sum, id) => sum + (addons.find((a) => a.id === id)?.price || 0),
      0,
    );
    return (product.price + extras) * qty;
  }, [product, chosenAddons, addons, qty]);

  if (loading) {
    return (
      <div className="wrap py-16" aria-busy="true">
        <div className="aspect-4/3 rounded-sm" style={{ background: 'var(--color-paper-3)' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="wrap py-24">
        <h1 className="text-3xl">Ese desayuno no está en la carta</h1>
        <Link to="/desayunos" className="btn btn-primary mt-6">
          Volver a la carta
        </Link>
      </div>
    );
  }

  const missing = [];
  if (!date) missing.push('el día');
  if (!slot) missing.push('la franja de entrega');
  const ready = missing.length === 0;

  function onSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (!ready) {
      configRef.current?.scrollIntoView({ block: 'center' });
      return;
    }
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      qty,
      addons: chosenAddons,
      removed,
      delivery: { date, slot },
      recipient,
      message,
    });
    setAdded(true);
  }

  const related = [...products]
    .filter((p) => p.id !== product.id)
    .sort((a, b) => b.sold - a.sold || Number(b.featured) - Number(a.featured))
    .slice(0, 4);
  const reviews = product.reviews || [];
  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;
  const foodAddons = addons.filter((a) => a.category === 'comida');
  const detailAddons = addons.filter((a) => a.category !== 'comida');

  return (
    <article>
      {/* Galería grande: la fotografía manda antes que el texto */}
      <section className="wrap pt-8">
        <nav className="mb-5 text-sm text-muted" aria-label="Migas de pan">
          <Link to="/desayunos" className="link nowrap">
            La carta
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span>{product.name}</span>
        </nav>

        <div className="grid gap-3 md:grid-cols-[1fr_minmax(0,18rem)]">
          <div className="tile relative aspect-4/3 md:aspect-16/11" style={{ background: 'var(--color-paper-3)' }}>
            <img
              src={product.images[activeImage]}
              alt={`${product.name} — foto ${activeImage + 1}`}
              width="1400"
              height="960"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {product.compareAt > product.price && (
                <span className="chip chip-solid nums">
                  −{Math.round((1 - product.price / product.compareAt) * 100)} %
                </span>
              )}
              {product.badges?.map((badge) => (
                <span
                  key={badge}
                  className={`chip ${badge === 'Sin azúcar añadida' ? 'chip-leaf' : 'chip-ink'}`}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            {product.images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={activeImage === i}
                onClick={() => setActiveImage(i)}
                className="tile aspect-4/3 transition-all duration-150"
                style={{
                  borderColor: activeImage === i ? 'var(--color-accent)' : 'var(--color-rule)',
                  opacity: activeImage === i ? 1 : 0.72,
                }}
              >
                <img src={src} alt="" loading="lazy" width="320" height="240" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap grid gap-10 py-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        {/* --------------------------------------------------- columna izquierda */}
        <div>
          <p className="flex flex-wrap gap-1.5">
            <span className="chip">{categoryLabel(product.category)}</span>
            <span className="chip">
              {product.serves === 1 ? 'Para una persona' : `Para ${product.serves} personas`}
            </span>
            <span className="chip">{product.includes.length} cosas dentro</span>
            {product.sold > 0 && <span className="chip chip-accent nums">{product.sold} pedidos</span>}
          </p>
          <h1 className="mt-3" style={{ fontSize: 'var(--text-display-s)' }}>
            {product.name}
          </h1>
          <p className="measure mt-4 text-md">{product.description}</p>

          <h2 className="mt-10 text-xl">Qué trae la caja</h2>
          <p className="mt-1 text-sm text-muted">
            Destildá lo que no quieras. El precio no cambia, pero la caja sí.
          </p>
          <ul className="tile mt-4 divide-y divide-rule">
            {product.includes.map((item) => {
              const off = removed.includes(item.name);
              return (
                <li key={item.name}>
                  <label className="flex cursor-pointer items-start gap-3 p-3.5">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--color-accent)]"
                      checked={!off}
                      onChange={() =>
                        setRemoved((current) =>
                          off ? current.filter((n) => n !== item.name) : [...current, item.name],
                        )
                      }
                    />
                    <span className={off ? 'text-neutral line-through' : ''}>
                      <span className="block">{item.name}</span>
                      {item.detail && <span className="block text-sm text-muted">{item.detail}</span>}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-muted">{product.prepNote}</p>

          <h2 className="mt-12 text-xl">Sumale algo</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[...foodAddons, ...detailAddons].map((addon) => {
              const on = chosenAddons.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  className="tile flex cursor-pointer items-center gap-3 p-3 transition-colors duration-150"
                  style={{
                    borderColor: on ? 'var(--color-accent)' : 'var(--color-rule)',
                    background: on ? 'var(--color-accent-soft)' : 'var(--color-paper)',
                  }}
                >
                  <input
                    type="checkbox"
                    className="accent-[var(--color-accent)]"
                    checked={on}
                    onChange={() =>
                      setChosenAddons((current) =>
                        on ? current.filter((id) => id !== addon.id) : [...current, addon.id],
                      )
                    }
                  />
                  <span className="min-w-0 flex-1 text-sm">{addon.name}</span>
                  <span className="nums shrink-0 text-sm">+ {money(addon.price)}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* --------------------------------------------------- configurador */}
        {/* pb-20 en móvil: deja aire para que la barra fija no tape el botón */}
        <form onSubmit={onSubmit} ref={configRef} className="pb-20 lg:sticky lg:top-24 lg:self-start lg:pb-0">
          <div className="tile p-5" style={{ background: 'var(--color-paper-2)' }}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="nums font-display text-3xl">
                {product.compareAt > product.price && (
                  <span className="mr-2 text-lg text-neutral line-through">
                    {money(product.compareAt)}
                  </span>
                )}
                {money(total)}
              </p>
              {qty > 1 && <p className="nums text-sm text-muted">{money(total / qty)} c/u</p>}
            </div>

            <h2 className="mt-6 text-lg">Cuándo lo entregamos</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="field">
                <span>Día</span>
                <input
                  className="input"
                  type="date"
                  required
                  min={minDate}
                  value={date}
                  aria-invalid={touched && !date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Franja</span>
                <select
                  className="input"
                  required
                  value={slot}
                  aria-invalid={touched && !slot}
                  onChange={(e) => setSlot(e.target.value)}
                >
                  <option value="">Elegí una hora</option>
                  {settings?.delivery?.slots?.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-2 text-xs text-muted">{settings?.delivery?.cutoffNote}</p>

            <h2 className="mt-6 text-lg">Para quién es</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="field">
                <span>Nombre (opcional)</span>
                <input
                  className="input"
                  value={recipient.name}
                  placeholder="A quién se lo damos"
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Su celular (opcional)</span>
                <input
                  className="input"
                  type="tel"
                  inputMode="tel"
                  value={recipient.phone}
                  placeholder="Por si el portero no abre"
                  onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                />
              </label>
            </div>

            <label className="field mt-4">
              <span>Tarjeta escrita a mano</span>
              <textarea
                className="input"
                rows={3}
                maxLength={300}
                value={message}
                placeholder="Un detalle concreto funciona mejor que «te quiero mucho»."
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <p className="nums mt-1 text-right text-xs text-muted">{message.length}/300</p>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-pill border border-rule">
                <button
                  type="button"
                  className="px-3 py-2"
                  aria-label="Menos cajas"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="nums w-8 text-center">{qty}</span>
                <button
                  type="button"
                  className="px-3 py-2"
                  aria-label="Más cajas"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                >
                  +
                </button>
              </div>
              <button type="submit" className="btn btn-primary flex-1">
                Agregar al carrito
              </button>
            </div>

            <p className="mt-2 min-h-5 text-xs" role="status">
              {touched && !ready ? (
                <span style={{ color: 'var(--color-accent)' }}>Falta {missing.join(' y ')}.</span>
              ) : added ? (
                <span className="text-muted">
                  Agregado para el {prettyDate(date)}, {slot}.{' '}
                  <button type="button" className="link" onClick={() => navigate('/checkout')}>
                    Ir a pagar
                  </button>
                </span>
              ) : null}
            </p>
          </div>
        </form>
      </section>

      {/* En móvil el configurador queda al final de un scroll largo: esta barra
          mantiene el precio y la acción principal siempre a la vista. */}
      <div className="dock lg:hidden">
        <div className="wrap flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="nums font-display text-xl leading-none">{money(total)}</p>
            <p className="truncate text-xs text-muted">
              {date && slot ? `${prettyDate(date)} · ${slot}` : 'Falta elegir día y hora'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary shrink-0"
            onClick={(event) => {
              if (!ready) {
                setTouched(true);
                configRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
              }
              onSubmit(event);
            }}
          >
            {ready ? 'Agregar al carrito' : 'Elegir día y hora'}
          </button>
        </div>
      </div>

      {/* Reseñas: se muestran sólo si el panel cargó opiniones reales.
          Sin reseñas no hay estrellas — no se inventa una valoración. */}
      {reviews.length > 0 && (
        <section className="border-t border-rule bg-paper-2">
          <div className="wrap py-12">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl">Lo que dijeron</h2>
              <span className="chip nums">
                ★ {average} · {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 6).map((review, i) => (
                <blockquote key={i} className="tile p-4">
                  <p className="nums text-sm" style={{ color: 'var(--color-accent)' }}>
                    {'★'.repeat(Math.round(Number(review.rating) || 0))}
                  </p>
                  <p className="mt-2">{review.text}</p>
                  <footer className="mt-3 text-sm text-muted">— {review.name}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-rule">
          <div className="wrap py-12">
            <h2 className="text-2xl">También se piden mucho</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
