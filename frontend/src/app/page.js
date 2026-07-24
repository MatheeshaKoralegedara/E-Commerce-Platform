// frontend/src/app/page.js
import Link from 'next/link';

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
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="eyebrow mb-2">The Collection</p>
        <h1 className="section-heading font-display text-3xl">Everyday goods, made to last</h1>
      </div>

      <div className="flex gap-2 mb-10 flex-wrap">
        <Link
          href="/"
          className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
            !category
              ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
              : 'border-[var(--color-line)] hover:border-[var(--color-ink)]'
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
                : 'border-[var(--color-line)] hover:border-[var(--color-ink)]'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-[var(--color-muted)]">No products found{category ? ' in this category' : ''}.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const firstVariant = product.variants[0];
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="card-product rounded-md overflow-hidden group">
                <div className="aspect-square bg-[var(--color-line)]/40 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-display text-lg">{product.name}</h2>
                  <p className="text-[var(--color-muted)] text-sm mt-1 line-clamp-1">{product.description}</p>
                  {firstVariant && (
                    <p className="mt-3 font-medium">${(firstVariant.price_cents / 100).toFixed(2)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}