import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import { money } from '../lib/format.js';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.summary().then(setSummary).catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ color: 'var(--color-accent)' }}>{error}</p>;
  if (!summary) return <p className="text-muted">Cargando…</p>;

  const cards = [
    { label: 'Desayunos publicados', value: `${summary.activeProducts} de ${summary.products}`, to: '/admin/productos' },
    { label: 'Pedidos sin cerrar', value: String(summary.pending), to: '/admin/pedidos' },
    { label: 'Pedidos totales', value: String(summary.orders), to: '/admin/pedidos' },
    { label: 'Facturado', value: money(summary.revenue), to: '/admin/pedidos' },
    { label: 'Suscriptores', value: String(summary.subscribers), to: '/admin/contenido' },
    { label: 'Cuentas de cliente', value: String(summary.users), to: '/admin/pedidos' },
  ];

  return (
    <div>
      <h1 className="text-3xl">Resumen</h1>
      <p className="mt-2 text-muted">Todo lo que cambies aquí se refleja en el sitio al instante.</p>

      <div className="mt-8 grid gap-px overflow-hidden rounded-sm sm:grid-cols-2 lg:grid-cols-3"
        style={{ background: 'var(--color-rule)' }}>
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="bg-paper p-5 transition-colors hover:bg-paper-2">
            <p className="text-xs uppercase tracking-widest text-muted">{card.label}</p>
            <p className="nums mt-2 font-display text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-rule bg-paper-2 p-5 text-sm">
        <h2 className="text-lg">Qué se maneja desde aquí</h2>
        <ul className="mt-3 space-y-1.5 text-muted">
          <li>
            <strong className="text-ink">Desayunos</strong> — precio, fotos, qué trae la caja,
            publicar o despublicar, marcar destacados y poner precio tachado para ofertas.
          </li>
          <li>
            <strong className="text-ink">Adicionales</strong> — lo que el cliente puede sumarle a la caja.
          </li>
          <li>
            <strong className="text-ink">Contenido del sitio</strong> — titular del hero, banner
            superior, franjas de entrega, costo de domicilio, descuento del primer pedido y qué
            secciones se muestran en el home.
          </li>
        </ul>
      </div>
    </div>
  );
}
