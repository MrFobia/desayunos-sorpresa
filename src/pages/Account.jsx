import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { api } from '../lib/api.js';

export default function Account() {
  const { user, setUser, logout, settings } = useStore();
  const [mode, setMode] = useState('ingreso'); // ingreso | registro
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const result =
        mode === 'registro'
          ? await api.register(form)
          : await api.login({ email: form.email, password: form.password });
      setUser(result.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (user) {
    return (
      <div className="wrap py-14">
        <h1 className="text-4xl">Hola, {user.name.split(' ')[0]}</h1>
        <p className="measure mt-3 text-muted">
          {user.firstOrderUsed
            ? 'Ya usaste el descuento de bienvenida. Los pedidos siguientes van a precio de carta.'
            : `Tu primer pedido lleva ${settings?.discountFirstOrder} % de descuento. Se aplica solo al confirmar.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/desayunos" className="btn btn-primary">
            Ver la carta
          </Link>
          <Link to="/pedido" className="btn btn-ghost">
            Seguir un pedido
          </Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap py-14">
      <h1 className="text-4xl">{mode === 'registro' ? 'Crear cuenta' : 'Ingresar'}</h1>
      <p className="measure mt-3 text-muted">
        La cuenta es opcional: podés pedir sin registrarte. Sirve para guardar tus datos y para el{' '}
        {settings?.discountFirstOrder} % del primer pedido.
      </p>

      <form onSubmit={onSubmit} className="mt-8 max-w-md">
        {mode === 'registro' && (
          <label className="field mb-4">
            <span>Nombre</span>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}
        <label className="field mb-4">
          <span>Correo</span>
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            className="input"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        {error && (
          <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }} role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" disabled={sending}>
            {sending ? 'Un momento…' : mode === 'registro' ? 'Crear cuenta' : 'Entrar'}
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              setMode(mode === 'registro' ? 'ingreso' : 'registro');
              setError('');
            }}
          >
            {mode === 'registro' ? 'Ya tengo cuenta' : 'Quiero crear una cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
}
