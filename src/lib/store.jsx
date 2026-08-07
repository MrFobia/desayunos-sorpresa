import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const StoreContext = createContext(null);

const CART_KEY = 'aurora.cart';
const USER_KEY = 'aurora.user';

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [data, setData] = useState({ products: [], addons: [], posts: [], settings: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(() => readLocal(CART_KEY, []));
  const [user, setUser] = useState(() => readLocal(USER_KEY, null));

  const refresh = useCallback(() => {
    setLoading(true);
    return api
      .bootstrap()
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const [cartOpen, setCartOpen] = useState(false);

  /* Agregar abre el panel del carrito: el usuario ve el resultado de su acción
     sin tener que buscarlo, que es el punto de la retroalimentación inmediata. */
  const addToCart = useCallback((line) => {
    setCart((current) => [...current, { ...line, lineId: crypto.randomUUID() }]);
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((lineId) => {
    setCart((current) => current.filter((l) => l.lineId !== lineId));
  }, []);

  const setQty = useCallback((lineId, qty) => {
    setCart((current) =>
      current.map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  /* Los totales se muestran aquí y se recalculan en el servidor al confirmar. */
  const totals = useMemo(() => {
    const settings = data.settings;
    const addonPrice = (id) => data.addons.find((a) => a.id === id)?.price || 0;
    const subtotal = cart.reduce((sum, line) => {
      const extras = (line.addons || []).reduce((s, id) => s + addonPrice(id), 0);
      return sum + (line.price + extras) * line.qty;
    }, 0);
    const rate = user && !user.firstOrderUsed ? (settings?.discountFirstOrder || 0) / 100 : 0;
    const discount = Math.round(subtotal * rate);
    const afterDiscount = subtotal - discount;
    const fee = !settings ? 0 : afterDiscount >= settings.delivery.freeFrom ? 0 : settings.delivery.fee;
    return {
      subtotal,
      discount,
      deliveryFee: cart.length ? fee : 0,
      total: afterDiscount + (cart.length ? fee : 0),
      count: cart.reduce((n, l) => n + l.qty, 0),
    };
  }, [cart, data.addons, data.settings, user]);

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      refresh,
      cart,
      cartOpen,
      setCartOpen,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      totals,
      user,
      setUser,
      logout: () => setUser(null),
    }),
    [
      data,
      loading,
      error,
      refresh,
      cart,
      cartOpen,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      totals,
      user,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
