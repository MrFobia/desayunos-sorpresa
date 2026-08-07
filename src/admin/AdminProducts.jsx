import { useState } from 'react';
import { useCollection, useMedia, Field, DangerDelete, ImagePicker } from './ui.jsx';
import { money, categoryLabel, CATEGORY_LABELS } from '../lib/format.js';

const blank = {
  name: '',
  slug: '',
  price: 50000,
  compareAt: '',
  category: 'clasicos',
  tagline: '',
  description: '',
  images: [],
  includes: [],
  serves: 1,
  badges: [],
  reviews: [],
  featured: false,
  active: true,
  prepNote: '',
};

export default function AdminProducts() {
  const { items, loading, error, create, update, remove } = useCollection('products');
  const media = useMedia();
  const [editing, setEditing] = useState(null);

  if (loading) return <p className="text-muted">Cargando desayunos…</p>;
  if (error) return <p style={{ color: 'var(--color-accent)' }}>{error}</p>;

  async function save(draft) {
    const payload = {
      ...draft,
      price: Number(draft.price) || 0,
      compareAt: draft.compareAt === '' || draft.compareAt === null ? null : Number(draft.compareAt),
      serves: Number(draft.serves) || 1,
    };
    if (draft.id) await update(draft.id, payload);
    else await create(payload);
    setEditing(null);
  }

  if (editing) {
    return <ProductEditor draft={editing} media={media} onCancel={() => setEditing(null)} onSave={save} />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Desayunos</h1>
        <button type="button" className="btn btn-primary nowrap" onClick={() => setEditing({ ...blank })}>
          Nuevo desayuno
        </button>
      </div>

      <ul className="mt-8 divide-y divide-rule border-y border-rule">
        {items.map((product) => (
          <li key={product.id} className="flex flex-wrap items-center gap-4 py-4">
            <img
              src={product.images[0]}
              alt=""
              loading="lazy"
              width="56"
              height="70"
              className="h-[70px] w-14 shrink-0 rounded-sm object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight">{product.name}</p>
              <p className="nums text-sm text-muted">
                {money(product.price)}
                {product.compareAt ? ` · antes ${money(product.compareAt)}` : ''} ·{' '}
                {categoryLabel(product.category)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Toggle
                on={product.active}
                onLabel="Publicado"
                offLabel="Oculto"
                onChange={(value) => update(product.id, { active: value })}
              />
              <Toggle
                on={product.featured}
                onLabel="Destacado"
                offLabel="Normal"
                onChange={(value) => update(product.id, { featured: value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-ghost nowrap" onClick={() => setEditing(product)}>
                Editar
              </button>
            </div>
            <div className="w-full">
              <DangerDelete
                label="Borrar"
                name={product.name}
                onConfirm={() => remove(product.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Toggle({ on, onLabel, offLabel, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className="rounded-pill border px-2.5 py-1 nowrap"
      style={{
        borderColor: on ? 'var(--color-leaf)' : 'var(--color-rule)',
        color: on ? 'var(--color-leaf)' : 'var(--color-muted)',
        background: on ? 'var(--color-leaf-soft)' : 'transparent',
      }}
    >
      {on ? onLabel : offLabel}
    </button>
  );
}

function ProductEditor({ draft: initial, media, onCancel, onSave }) {
  const [draft, setDraft] = useState(initial);
  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });

  const setInclude = (index, key, value) => {
    const includes = draft.includes.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    setDraft({ ...draft, includes });
  };

  const setReview = (index, key, value) => {
    const reviews = draft.reviews.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    setDraft({ ...draft, reviews });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{draft.id ? `Editar ${initial.name}` : 'Nuevo desayuno'}</h1>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost nowrap" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary nowrap">Guardar</button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Field label="Nombre">
          <input className="input" required value={draft.name} onChange={set('name')} />
        </Field>
        <Field label="Dirección web (slug)" hint="Se genera del nombre si lo dejás vacío.">
          <input className="input" value={draft.slug} onChange={set('slug')} placeholder="despertar-sencillo" />
        </Field>
        <Field label="Precio (COP)">
          <input className="input nums" type="number" min="0" step="1000" value={draft.price} onChange={set('price')} />
        </Field>
        <Field label="Precio tachado" hint="Poné un valor mayor al precio para que aparezca en Ofertas.">
          <input
            className="input nums"
            type="number"
            min="0"
            step="1000"
            value={draft.compareAt ?? ''}
            onChange={set('compareAt')}
          />
        </Field>
        <Field label="Categoría">
          <select className="input" value={draft.category} onChange={set('category')}>
            {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Para cuántas personas">
          <input className="input nums" type="number" min="1" max="8" value={draft.serves} onChange={set('serves')} />
        </Field>
        <Field label="Frase corta" hint="Se ve debajo del nombre en la grilla.">
          <input className="input" value={draft.tagline} onChange={set('tagline')} />
        </Field>
        <Field label="Nota de preparación">
          <input className="input" value={draft.prepNote} onChange={set('prepNote')} />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea className="input mt-2" rows={4} value={draft.description} onChange={set('description')} />
      </Field>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted">
          Fotos — el orden de selección es el orden de la galería
        </p>
        <ImagePicker media={media} value={draft.images} onChange={(images) => setDraft({ ...draft, images })} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted">Qué trae la caja</p>
          <button
            type="button"
            className="btn btn-quiet text-sm"
            onClick={() => setDraft({ ...draft, includes: [...draft.includes, { name: '', detail: '' }] })}
          >
            + Agregar ítem
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {draft.includes.map((item, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                className="input"
                value={item.name}
                placeholder="Jugo de naranja natural"
                onChange={(e) => setInclude(i, 'name', e.target.value)}
              />
              <input
                className="input"
                value={item.detail || ''}
                placeholder="350 ml"
                onChange={(e) => setInclude(i, 'detail', e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost nowrap"
                onClick={() =>
                  setDraft({ ...draft, includes: draft.includes.filter((_, index) => index !== i) })
                }
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Reseñas reales. Mientras la lista esté vacía, la ficha no muestra
          estrellas: no se inventa una valoración para llenar el hueco. */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted">
            Reseñas de clientes ({(draft.reviews || []).length})
          </p>
          <button
            type="button"
            className="btn btn-quiet text-sm"
            onClick={() =>
              setDraft({
                ...draft,
                reviews: [...(draft.reviews || []), { name: '', rating: 5, text: '' }],
              })
            }
          >
            + Agregar reseña
          </button>
        </div>
        {(draft.reviews || []).length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Sin reseñas todavía. La ficha no muestra estrellas hasta que cargues opiniones reales.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {draft.reviews.map((review, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-[10rem_5rem_1fr_auto]">
                <input
                  className="input"
                  value={review.name}
                  placeholder="Nombre"
                  onChange={(e) => setReview(i, 'name', e.target.value)}
                />
                <input
                  className="input nums"
                  type="number"
                  min="1"
                  max="5"
                  step="1"
                  value={review.rating}
                  onChange={(e) => setReview(i, 'rating', Number(e.target.value))}
                />
                <input
                  className="input"
                  value={review.text}
                  placeholder="Qué dijo"
                  onChange={(e) => setReview(i, 'text', e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost nowrap"
                  onClick={() =>
                    setDraft({ ...draft, reviews: draft.reviews.filter((_, index) => index !== i) })
                  }
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-5">
        <Field label="Etiquetas" hint="Separadas por coma. Ej: Más vendido, Para niños">
          <input
            className="input"
            value={(draft.badges || []).join(', ')}
            onChange={(e) =>
              setDraft({ ...draft, badges: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
            }
          />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            className="accent-[var(--color-accent)]"
            checked={draft.active !== false}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          Publicado en el sitio
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            className="accent-[var(--color-accent)]"
            checked={Boolean(draft.featured)}
            onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
          />
          Mostrar en «Los más pedidos»
        </label>
      </div>

      <div className="mt-10 flex gap-2">
        <button className="btn btn-primary nowrap">Guardar</button>
        <button type="button" className="btn btn-ghost nowrap" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
