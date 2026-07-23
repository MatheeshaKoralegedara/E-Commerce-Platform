
import Link from 'next/link';

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
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Search results for "{q}"
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => {
            const firstVariant = product.variants[0];
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-lg">{product.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                {firstVariant && (
                  <p className="mt-3 font-bold">
                    ${(firstVariant.price_cents / 100).toFixed(2)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}