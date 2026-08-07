import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { adminApi } from '../lib/api.js';
import AdminDashboard from './AdminDashboard.jsx';
import AdminProducts from './AdminProducts.jsx';
import AdminAddons from './AdminAddons.jsx';
import AdminPosts from './AdminPosts.jsx';
import AdminOrders from './AdminOrders.jsx';
import AdminContent from './AdminContent.jsx';

const NAV = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/productos', label: 'Desayunos' },
  { to: '/admin/adicionales', label: 'Adicionales' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/diario', label: 'Diario' },
  { to: '/admin/contenido', label: 'Contenido del sitio' },
];

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('aurora.admin'));

  if (!token) return <AdminLogin onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-rule">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl">Aurora</span>
            <span className="text-sm text-muted">Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="link nowrap text-sm">
              Ver el sitio
            </Link>
            <button
              type="button"
              className="btn btn-ghost nowrap"
              onClick={() => {
                localStorage.removeItem('aurora.admin');
                setToken(null);
              }}
            >
              Salir
            </button>
          </div>
        </div>
        <nav className="wrap flex gap-1 overflow-x-auto pb-2" aria-label="Panel">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="rounded-pill px-3.5 py-1.5 text-sm nowrap"
              style={({ isActive }) => ({
                background: isActive ? 'var(--color-ink)' : 'transparent',
                color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="wrap py-8">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="adicionales" element={<AdminAddons />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="diario" element={<AdminPosts />} />
          <Route path="contenido" element={<AdminContent />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = 'Panel — Aurora Desayunos';
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const { token } = await adminApi.login(password);
      localStorage.setItem('aurora.admin', token);
      onLogin(token);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="wrap flex min-h-screen max-w-md flex-col justify-center">
      <h1 className="text-3xl">Panel de Aurora</h1>
      <p className="mt-2 text-sm text-muted">
        Acceso interno. La contraseña por defecto es <code>aurora2026</code> y se cambia con la
        variable de entorno <code>ADMIN_PASSWORD</code>.
      </p>
      <form onSubmit={onSubmit} className="mt-6">
        <label className="field">
          <span>Contraseña</span>
          <input
            className="input"
            type="password"
            autoFocus
            required
            value={password}
            aria-invalid={Boolean(error)}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="mt-3 text-sm" style={{ color: 'var(--color-accent)' }} role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary mt-5 w-full" disabled={sending}>
          {sending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <Link to="/" className="btn btn-quiet mt-6 nowrap">
        ← Volver al sitio
      </Link>
    </div>
  );
}
