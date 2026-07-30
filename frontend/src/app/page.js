// frontend/src/app/page.js
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

async function getProducts(categorySlug) {
  const url = categorySlug
    ? `${process.env.NEXT_PUBLIC_API_URL}/products?category=${categorySlug}`
    : `${process.env.NEXT_PUBLIC_API_URL}/products`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export default async function HomePage({ searchParams }) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(category),
    getCategories(),
  ]);

  return (
    <main>
      <section className="relative overflow-hidden bg-[var(--color-pine-dark)] text-[var(--color-canvas)]">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="animate-fade-up">
            <p className="eyebrow mb-4" style={{ color: 'var(--color-clay-light)' }}>The Collection · Est. 2024</p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-6">
              Everyday goods,<br />made to last.
            </h1>
            <p className="text-white/70 max-w-md mb-8 leading-relaxed">
              Considered essentials, sourced from makers who care about materials
              as much as you do. No trends — just things worth keeping.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#collection" className="btn btn-primary rounded-full px-6 py-3 text-sm" style={{ background: 'var(--color-clay)' }}>
                Shop the collection
              </Link>
              <a href="#collection" className="btn rounded-full px-6 py-3 text-sm border border-white/25 text-white hover:bg-white/10 transition-colors">
                Browse categories
              </a>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className={`aspect-square rounded-lg overflow-hidden ring-1 ring-white/10 ${i % 3 === 1 ? 'translate-y-6' : ''}`}
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="collection" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow mb-2">Browse</p>
            <h2 className="section-heading font-display text-3xl">
              {category ? categories.find((c) => c.slug === category)?.name || 'Products' : 'All products'}
            </h2>
          </div>

          <div className="flex gap-2 flex-wrap scrollbar-none">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                !category
                  ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                  : 'border-[var(--color-line)] hover:border-[var(--color-ink)] bg-[var(--color-surface)]'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  category === cat.slug
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                    : 'border-[var(--color-line)] hover:border-[var(--color-ink)] bg-[var(--color-surface)]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title="No products found"
            description={category ? 'Nothing in this category yet — check back soon.' : 'The shelves are empty right now.'}
            action={category ? <Link href="/" className="btn btn-secondary rounded-full px-5 py-2 text-sm">View all products</Link> : null}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
