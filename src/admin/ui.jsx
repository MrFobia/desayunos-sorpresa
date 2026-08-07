import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api.js';

/** Carga una colección del panel y expone helpers de CRUD ya conectados. */
export function useCollection(name) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    return adminApi
      .list(name)
      .then((data) => {
        setItems(data);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return {
    items,
    loading,
    error,
    reload: load,
    create: (body) => adminApi.create(name, body).then(load),
    update: (id, body) => adminApi.update(name, id, body).then(load),
    remove: (id) => adminApi.remove(name, id).then(load),
  };
}

export function useMedia() {
  const [media, setMedia] = useState([]);
  useEffect(() => {
    adminApi.list('media').then(setMedia).catch(() => setMedia([]));
  }, []);
  return media;
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs normal-case tracking-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Panel({ title, action, children }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Confirmación por escritura del nombre: sólo para borrados irreversibles. */
export function DangerDelete({ label, name, onConfirm }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');

  if (!open) {
    return (
      <button type="button" className="btn btn-quiet text-sm" onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-sm border p-3" style={{ borderColor: 'var(--color-accent)' }}>
      <p className="text-sm">
        Esto borra <strong>{name}</strong> para siempre. Escribí el nombre para confirmar.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input className="input max-w-xs" value={typed} onChange={(e) => setTyped(e.target.value)} />
        <button
          type="button"
          className="btn btn-primary nowrap"
          disabled={typed.trim() !== name}
          onClick={() => onConfirm()}
        >
          Borrar
        </button>
        <button type="button" className="btn btn-ghost nowrap" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function ImagePicker({ media, value = [], onChange, single = false }) {
  const toggle = (src) => {
    if (single) return onChange([src]);
    onChange(value.includes(src) ? value.filter((s) => s !== src) : [...value, src]);
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {media.map((src) => {
          const on = value.includes(src);
          const order = value.indexOf(src) + 1;
          return (
            <button
              key={src}
              type="button"
              onClick={() => toggle(src)}
              aria-pressed={on}
              className="relative aspect-square overflow-hidden rounded-sm"
              style={{ outline: on ? '2px solid var(--color-accent)' : 'none', outlineOffset: '1px' }}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              {on && !single && (
                <span
                  className="nums absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-pill text-xs"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-paper)' }}
                >
                  {order}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        Las imágenes salen de <code>public/img</code>. Copiá archivos nuevos ahí y aparecen acá.
      </p>
    </div>
  );
}

export function SavedFlag({ at }) {
  if (!at) return <span className="text-xs text-muted" />;
  return (
    <span className="text-xs text-muted" role="status">
      Guardado {new Date(at).toLocaleTimeString('es-CO')}
    </span>
  );
}
