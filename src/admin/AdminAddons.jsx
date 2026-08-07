import { useState } from 'react';
import { useCollection, useMedia, Field, DangerDelete, ImagePicker } from './ui.jsx';
import { money } from '../lib/format.js';

const blank = { name: '', price: 10000, category: 'comida', image: '', active: true };

export default function AdminAddons() {
  const { items, loading, error, create, update, remove } = useCollection('addons');
  const media = useMedia();
  const [draft, setDraft] = useState(null);

  if (loading) return <p className="text-muted">Cargando adicionales…</p>;
  if (error) return <p style={{ color: 'var(--color-accent)' }}>{error}</p>;

  async function save(event) {
    event.preventDefault();
    const payload = { ...draft, price: Number(draft.price) || 0 };
    if (draft.id) await update(draft.id, payload);
    else await create(payload);
    setDraft(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Adicionales</h1>
        <button type="button" className="btn btn-primary nowrap" onClick={() => setDraft({ ...blank })}>
          Nuevo adicional
        </button>
      </div>
      <p className="mt-2 text-muted">
        Lo que el cliente puede sumarle a cualquier caja desde la página del desayuno.
      </p>

      {draft && (
        <form onSubmit={save} className="mt-6 rounded-sm border border-rule bg-paper-2 p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Nombre">
              <input className="input" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Precio (COP)">
              <input
                className="input nums"
                type="number"
                min="0"
                step="500"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              />
            </Field>
            <Field label="Tipo">
              <select
                className="input"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              >
                <option value="comida">Comida</option>
                <option value="detalle">Detalle</option>
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-widest text-muted">Foto</p>
            <ImagePicker
              media={media}
              single
              value={draft.image ? [draft.image] : []}
              onChange={([image]) => setDraft({ ...draft, image })}
            />
          </div>
          <div className="mt-5 flex gap-2">
            <button className="btn btn-primary nowrap">Guardar</button>
            <button type="button" className="btn btn-ghost nowrap" onClick={() => setDraft(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <ul className="mt-8 divide-y divide-rule border-y border-rule">
        {items.map((addon) => (
          <li key={addon.id} className="flex flex-wrap items-center gap-4 py-3">
            {addon.image && (
              <img src={addon.image} alt="" loading="lazy" width="40" height="40" className="h-10 w-10 rounded-sm object-cover" />
            )}
            <p className="min-w-0 flex-1">{addon.name}</p>
            <p className="nums text-sm">{money(addon.price)}</p>
            <button
              type="button"
              className="rounded-pill border px-2.5 py-1 text-xs nowrap"
              aria-pressed={addon.active}
              onClick={() => update(addon.id, { active: !addon.active })}
              style={{
                borderColor: addon.active ? 'var(--color-leaf)' : 'var(--color-rule)',
                color: addon.active ? 'var(--color-leaf)' : 'var(--color-muted)',
              }}
            >
              {addon.active ? 'Activo' : 'Oculto'}
            </button>
            <button type="button" className="btn btn-ghost nowrap" onClick={() => setDraft(addon)}>
              Editar
            </button>
            <div className="w-full">
              <DangerDelete label="Borrar" name={addon.name} onConfirm={() => remove(addon.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
