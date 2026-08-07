import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { shortDate } from '../lib/format.js';

export default function BlogPost() {
  const { slug } = useParams();
  const { posts, loading } = useStore();
  const post = posts.find((p) => p.slug === slug);

  if (loading) return <div className="wrap py-24 text-muted">Cargando…</div>;

  if (!post) {
    return (
      <div className="wrap py-24">
        <h1 className="text-3xl">Esa nota no existe</h1>
        <Link to="/diario" className="btn btn-primary mt-6">
          Ir al diario
        </Link>
      </div>
    );
  }

  return (
    <article className="wrap py-14">
      <p className="text-xs text-neutral">
        {shortDate(post.date)} · {post.author}
      </p>
      <h1 className="measure mt-2" style={{ fontSize: 'var(--text-display-s)' }}>
        {post.title}
      </h1>

      <div
        className="mt-8 aspect-16/9 overflow-hidden rounded-sm"
        style={{ background: 'var(--color-paper-3)' }}
      >
        <img
          src={post.cover}
          alt=""
          width="1400"
          height="790"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="measure mt-10 space-y-5 text-md">
        {post.body.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <hr className="rule mt-12" />
      <Link to="/diario" className="btn btn-quiet mt-6 nowrap">
        ← Todas las notas
      </Link>
    </article>
  );
}
