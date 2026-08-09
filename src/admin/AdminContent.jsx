import { useEffect, useState } from 'react';
import { adminApi, api } from '../lib/api.js';
import { Field, ImagePicker, useMedia } from './ui.jsx';

export default function AdminContent() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const media = useMedia();

  useEffect(() => {
    api.bootstrap().then((data) => setSettings(data.settings)).catch((e) => setError(e.message));
    adminApi.list('subscribers').then(setSubscribers).catch(() => setSubscribers([]));
  }, []);

  if (error) return <p style={{ color: 'var(--color-accent)' }}>{error}</p>;
  if (!settings) return <p className="text-muted">Cargando…</p>;

  const patch = (path, value) => {
    setSettings((current) => {
      const next = structuredClone(current);
      let node = next;
      const keys = path.split('.');
      keys.slice(0, -1).forEach((k) => {
        node = node[k];
      });
      node[keys.at(-1)] = value;
      return next;
    });
  };

  async function save(event) {
    event.preventDefault();
    try {
      await adminApi.saveSettings(settings);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <form onSubmit={save}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Contenido del sitio</h1>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-muted" role="status">
              Guardado {new Date(savedAt).toLocaleTimeString('es-CO')}
            </span>
          )}
          <button className="btn btn-primary nowrap">Guardar cambios</button>
        </div>
      </div>

      <Block title="Marca">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <input className="input" value={settings.brand.name} onChange={(e) => patch('brand.name', e.target.value)} />
          </Field>
          <Field label="Bajada">
            <input className="input" value={settings.brand.tagline} onChange={(e) => patch('brand.tagline', e.target.value)} />
          </Field>
          <Field label="Ciudad">
            <input className="input" value={settings.brand.city} onChange={(e) => patch('brand.city', e.target.value)} />
          </Field>
          <Field label="WhatsApp" hint="Solo números, con indicativo. Ej: 573001234567">
            <input className="input nums" value={settings.brand.whatsapp} onChange={(e) => patch('brand.whatsapp', e.target.value)} />
          </Field>
        </div>
      </Block>

      <Block title="Banner superior">
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-[var(--color-accent)]"
            checked={settings.banner.active}
            onChange={(e) => patch('banner.active', e.target.checked)}
          />
          Mostrar el banner
        </label>
        <Field label="Texto">
          <input className="input" value={settings.banner.text} onChange={(e) => patch('banner.text', e.target.value)} />
        </Field>
      </Block>

      <Block title="Hero del home">
        <div className="grid gap-4">
          <Field label="Titular" hint="Corto funciona mejor: hasta 7 palabras.">
            <input className="input" value={settings.hero.title} onChange={(e) => patch('hero.title', e.target.value)} />
          </Field>
          <Field label="Texto de apoyo">
            <textarea className="input" rows={3} value={settings.hero.subtitle} onChange={(e) => patch('hero.subtitle', e.target.value)} />
          </Field>
          <Field label="Texto del botón">
            <input className="input max-w-xs" value={settings.hero.ctaLabel} onChange={(e) => patch('hero.ctaLabel', e.target.value)} />
          </Field>
        </div>
        <p className="mt-4 mb-2 text-xs uppercase tracking-widest text-muted">
          Foto de respaldo (se usa en móvil y cuando el 3D no corre)
        </p>
        <ImagePicker media={media} single value={[settings.hero.image]} onChange={([image]) => patch('hero.image', image)} />
      </Block>

      <Block title="Secciones del home">
        <div className="flex flex-wrap gap-4">
          {[
            ['bestsellers', 'Los más pedidos'],
            ['catalog', 'Toda la carta'],
            ['offers', 'Ofertas'],
            ['blog', 'Diario'],
            ['newsletter', 'Newsletter en el pie'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-[var(--color-accent)]"
                checked={settings.sections[key] !== false}
                onChange={(e) => patch(`sections.${key}`, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Título de ofertas">
            <input className="input" value={settings.offers.title} onChange={(e) => patch('offers.title', e.target.value)} />
          </Field>
          <Field label="Nota de ofertas">
            <input className="input" value={settings.offers.note} onChange={(e) => patch('offers.note', e.target.value)} />
          </Field>
        </div>
      </Block>

      <Block title="Entregas y precios">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Costo de domicilio (COP)">
            <input
              className="input nums"
              type="number"
              min="0"
              step="500"
              value={settings.delivery.fee}
              onChange={(e) => patch('delivery.fee', Number(e.target.value))}
            />
          </Field>
          <Field label="Domicilio gratis desde (COP)">
            <input
              className="input nums"
              type="number"
              min="0"
              step="5000"
              value={settings.delivery.freeFrom}
              onChange={(e) => patch('delivery.freeFrom', Number(e.target.value))}
            />
          </Field>
          <Field label="Descuento primer pedido (%)">
            <input
              className="input nums"
              type="number"
              min="0"
              max="50"
              value={settings.discountFirstOrder}
              onChange={(e) => patch('discountFirstOrder', Number(e.target.value))}
            />
          </Field>
          <Field label="Días mínimos de anticipación">
            <input
              className="input nums"
              type="number"
              min="0"
              max="7"
              value={settings.delivery.minLeadDays}
              onChange={(e) => patch('delivery.minLeadDays', Number(e.target.value))}
            />
          </Field>
          <Field label="Ciudades" hint="Separadas por coma.">
            <input
              className="input"
              value={settings.delivery.cities.join(', ')}
              onChange={(e) =>
                patch('delivery.cities', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
              }
            />
          </Field>
          <Field label="Franjas de entrega" hint="Separadas por coma.">
            <input
              className="input"
              value={settings.delivery.slots.join(', ')}
              onChange={(e) =>
                patch('delivery.slots', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
              }
            />
          </Field>
        </div>
        <Field label="Nota de cierre de pedidos">
          <input className="input mt-2" value={settings.delivery.cutoffNote} onChange={(e) => patch('delivery.cutoffNote', e.target.value)} />
        </Field>
      </Block>

      <Block title={`Newsletter · ${subscribers.length} suscriptores`}>
        <div className="grid gap-4">
          <Field label="Título">
            <input className="input" value={settings.newsletter.title} onChange={(e) => patch('newsletter.title', e.target.value)} />
          </Field>
          <Field label="Texto">
            <textarea className="input" rows={2} value={settings.newsletter.body} onChange={(e) => patch('newsletter.body', e.target.value)} />
          </Field>
        </div>
        {subscribers.length > 0 && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-muted">Ver correos suscritos</summary>
            <ul className="mt-2 space-y-0.5">
              {subscribers.map((s) => (
                <li key={s.email}>{s.email}</li>
              ))}
            </ul>
          </details>
        )}
      </Block>

      <button className="btn btn-primary mt-4 nowrap">Guardar cambios</button>
    </form>
  );
}

function Block({ title, children }) {
  return (
    <section className="mt-10 border-t border-rule pt-6">
      <h2 className="mb-4 text-xl">{title}</h2>
      {children}
    </section>
  );
}
