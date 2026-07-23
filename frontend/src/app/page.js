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
  const { category } = await searchParams; // Next.js 15+ requires awaiting searchParams
  const [products, categories] = await Promise.all([
    getProducts(category),
    getCategories(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      {/* Category filter bar */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Link
          href="/"
          className={`px-4 py-2 rounded-full border text-sm ${
            !category ? 'bg-black text-white' : 'hover:bg-gray-100'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full border text-sm ${
              category === cat.slug ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found{category ? ' in this category' : ''}.</p>
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