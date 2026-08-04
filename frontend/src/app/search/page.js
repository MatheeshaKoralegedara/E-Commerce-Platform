import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <p className="eyebrow mb-2">Search</p>
      <h1 className="font-display text-2xl sm:text-3xl mb-8 text-balance">
        {products.length > 0 ? `${products.length} result${products.length !== 1 ? 's' : ''} for` : 'Results for'} &ldquo;{q}&rdquo;
      </h1>

      {products.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No matches"
          description={`We couldn't find anything for "${q}". Try a different search term.`}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
