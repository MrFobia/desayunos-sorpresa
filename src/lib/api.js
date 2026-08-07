const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

export const api = {
  bootstrap: () => request('/bootstrap'),
  product: (slug) => request(`/products/${slug}`),
  post: (slug) => request(`/posts/${slug}`),
  order: (code) => request(`/orders/${code}`),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  subscribe: (email) => request('/subscribers', { method: 'POST', body: JSON.stringify({ email }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
};

/* --- panel de administración ------------------------------------------- */

function adminHeaders() {
  const token = localStorage.getItem('aurora.admin');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminApi = {
  login: (password) => request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  summary: () => request('/admin/summary', { headers: adminHeaders() }),
  list: (collection) => request(`/admin/${collection}`, { headers: adminHeaders() }),
  create: (collection, body) =>
    request(`/admin/${collection}`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(body) }),
  update: (collection, id, body) =>
    request(`/admin/${collection}/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(body) }),
  remove: (collection, id) =>
    request(`/admin/${collection}/${id}`, { method: 'DELETE', headers: adminHeaders() }),
  saveSettings: (body) =>
    request('/admin/settings', { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(body) }),
};
