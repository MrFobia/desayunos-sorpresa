import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { shortDate } from '../lib/format.js';

export default function Blog() {
  const { posts } = useStore();

  return (
    <div className="wrap py-8 md:py-12">
      <div className="panel-dark grain relative px-6 py-8 md:px-8">
        <h1 className="text-3xl md:text-4xl">Diario de cocina</h1>
        <p className="measure mt-2 opacity-85">
          Lo que aprendemos armando cajas de madrugada.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="panel group">
            <Link to={`/diario/${post.slug}`} className="block">
              <div className="aspect-16/10 overflow-hidden" style={{ background: 'var(--color-paper-3)' }}>
                <img
                  src={post.cover}
                  alt=""
                  loading="lazy"
                  width="640"
                  height="400"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4">
                <p className="flex flex-wrap gap-1.5">
                  <span className="tag">{shortDate(post.date)}</span>
                  <span className="tag">{post.author}</span>
                </p>
                <h2 className="mt-2 text-xl leading-tight">{post.title}</h2>
                <p className="mt-1.5 text-sm text-muted">{post.excerpt}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
