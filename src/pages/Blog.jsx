import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { shortDate } from '../lib/format.js';

export default function Blog() {
  const { posts } = useStore();

  return (
    <div className="wrap py-14">
      <h1 className="text-4xl">Diario de cocina</h1>
      <p className="measure mt-3 text-md text-muted">
        Lo que aprendemos armando cajas de madrugada.
      </p>

      <div className="mt-12 divide-y divide-rule border-y border-rule">
        {posts.map((post) => (
          <article key={post.id}>
            <Link
              to={`/diario/${post.slug}`}
              className="group grid gap-5 py-8 md:grid-cols-[16rem_1fr] md:items-start"
            >
              <div
                className="aspect-16/10 overflow-hidden rounded-sm"
                style={{ background: 'var(--color-paper-3)' }}
              >
                <img
                  src={post.cover}
                  alt=""
                  loading="lazy"
                  width="640"
                  height="400"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div>
                <p className="text-xs text-neutral">
                  {shortDate(post.date)} · {post.author}
                </p>
                <h2 className="mt-1.5 text-2xl leading-tight">{post.title}</h2>
                <p className="measure mt-2 text-muted">{post.excerpt}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
