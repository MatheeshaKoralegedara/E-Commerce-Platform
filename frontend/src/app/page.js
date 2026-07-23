
import Link from 'next/link';

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: 'no-store', // always fetch fresh data; we'll add smarter caching later
  });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products available yet.</p>
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