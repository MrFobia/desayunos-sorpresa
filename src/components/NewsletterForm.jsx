import { useState } from 'react';
import { api } from '../lib/api.js';

export default function NewsletterForm({ dark = false }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setState('sending');
    try {
      await api.subscribe(email);
      setState('done');
      setMessage('Listo. Te escribimos el viernes.');
      setEmail('');
    } catch (e) {
      setState('error');
      setMessage(e.message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <label className="field">
        <span style={dark ? { color: 'var(--color-paper)', opacity: 0.65 } : undefined}>Tu correo</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input"
            type="email"
            required
            value={email}
            placeholder="nombre@correo.com"
            aria-invalid={state === 'error'}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state !== 'idle') setState('idle');
            }}
          />
          <button className="btn btn-primary sm:w-auto" disabled={state === 'sending'}>
            {state === 'sending' ? 'Enviando…' : 'Suscribirme'}
          </button>
        </div>
      </label>
      <p
        className="mt-2 min-h-5 text-xs"
        role="status"
        style={{
          color: state === 'error' ? 'var(--color-accent)' : 'var(--color-muted)',
          ...(dark && state !== 'error' ? { color: 'var(--color-paper)', opacity: 0.7 } : null),
        }}
      >
        {message}
      </p>
    </form>
  );
}
