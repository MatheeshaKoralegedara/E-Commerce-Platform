import Link from 'next/link';
import { formatPrice } from '@/lib/format';

async function searchProducts(q) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/search?q=${encodeURIComponent(q)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function SearchPage({ searchParams }) {
  const { q } = await searchParams;
  const products = q ? await searchProducts(q) : [];

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <p className="eyebrow mb-2">Search</p>
      <h1 className="font-display text-3xl mb-8">Results for "{q}"</h1>

      {products.length === 0 ? (
        <p className="text-[var(--color-muted)]">No products found matching your search.</p>
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
                    <p className="mt-3 font-medium">{formatPrice(firstVariant.price_cents)}</p>
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