import { useState } from 'react';
import { useCollection, useMedia, Field, DangerDelete, ImagePicker } from './ui.jsx';
import { shortDate } from '../lib/format.js';

const blank = {
  title: '',
  slug: '',
  excerpt: '',
  cover: '',
  author: 'Equipo Aurora',
  date: new Date().toISOString().slice(0, 10),
  body: '',
  published: true,
};

export default function AdminPosts() {
  const { items, loading, error, create, update, remove } = useCollection('posts');
  const media = useMedia();
  const [draft, setDraft] = useState(null);

  if (loading) return <p className="text-muted">Cargando notas…</p>;
  if (error) return <p style={{ color: 'var(--color-accent)' }}>{error}</p>;

  async function save(event) {
    event.preventDefault();
    if (draft.id) await update(draft.id, draft);
    else await create(draft);
    setDraft(null);
  }

  if (draft) {
    const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });
    return (
      <form onSubmit={save}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl">{draft.id ? 'Editar nota' : 'Nueva nota'}</h1>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost nowrap" onClick={() => setDraft(null)}>
              Cancelar
            </button>
            <button className="btn btn-primary nowrap">Guardar</button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Field label="Título">
            <input className="input" required value={draft.title} onChange={set('title')} />
          </Field>
          <Field label="Dirección web (slug)" hint="Se genera del título si lo dejas vacío.">
            <input className="input" value={draft.slug} onChange={set('slug')} />
          </Field>
          <Field label="Autor">
            <input className="input" value={draft.author} onChange={set('author')} />
          </Field>
          <Field label="Fecha">
            <input className="input" type="date" value={draft.date} onChange={set('date')} />
          </Field>
        </div>

        <Field label="Bajada">
          <textarea className="input mt-2" rows={2} value={draft.excerpt} onChange={set('excerpt')} />
        </Field>

        <Field label="Cuerpo" hint="Una línea en blanco separa párrafos.">
          <textarea className="input mt-2" rows={12} value={draft.body} onChange={set('body')} />
        </Field>

        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Foto de portada</p>
          <ImagePicker
            media={media}
            single
            value={draft.cover ? [draft.cover] : []}
            onChange={([cover]) => setDraft({ ...draft, cover })}
          />
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-[var(--color-accent)]"
            checked={draft.published !== false}
            onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
          />
          Publicada
        </label>

        <div className="mt-8 flex gap-2">
          <button className="btn btn-primary nowrap">Guardar</button>
          <button type="button" className="btn btn-ghost nowrap" onClick={() => setDraft(null)}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Diario</h1>
        <button type="button" className="btn btn-primary nowrap" onClick={() => setDraft({ ...blank })}>
          Nueva nota
        </button>
      </div>

      <ul className="mt-8 divide-y divide-rule border-y border-rule">
        {items.map((post) => (
          <li key={post.id} className="flex flex-wrap items-center gap-4 py-4">
            {post.cover && (
              <img src={post.cover} alt="" loading="lazy" width="64" height="40" className="h-10 w-16 rounded-sm object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight">{post.title}</p>
              <p className="text-sm text-muted">{shortDate(post.date)} · {post.author}</p>
            </div>
            <button
              type="button"
              className="rounded-pill border px-2.5 py-1 text-xs nowrap"
              aria-pressed={post.published}
              onClick={() => update(post.id, { published: !post.published })}
              style={{
                borderColor: post.published ? 'var(--color-leaf)' : 'var(--color-rule)',
                color: post.published ? 'var(--color-leaf)' : 'var(--color-muted)',
              }}
            >
              {post.published ? 'Publicada' : 'Borrador'}
            </button>
            <button type="button" className="btn btn-ghost nowrap" onClick={() => setDraft(post)}>
              Editar
            </button>
            <div className="w-full">
              <DangerDelete label="Borrar" name={post.title} onConfirm={() => remove(post.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
