import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Masthead from './components/Masthead.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Product from './pages/Product.jsx';
import Checkout from './pages/Checkout.jsx';
import ThankYou from './pages/ThankYou.jsx';
import OrderLookup from './pages/OrderLookup.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Account from './pages/Account.jsx';
import NotFound from './pages/NotFound.jsx';

const Admin = lazy(() => import('./admin/Admin.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="wrap py-24 text-muted">Cargando el panel…</div>}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <a href="#contenido" className="sr-only focus:not-sr-only">
        Saltar al contenido
      </a>
      <Masthead />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/desayunos" element={<Catalog />} />
          <Route path="/desayunos/:slug" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/gracias/:code" element={<ThankYou />} />
          <Route path="/pedido" element={<OrderLookup />} />
          <Route path="/pedido/:code" element={<OrderLookup />} />
          <Route path="/diario" element={<Blog />} />
          <Route path="/diario/:slug" element={<BlogPost />} />
          <Route path="/cuenta" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
