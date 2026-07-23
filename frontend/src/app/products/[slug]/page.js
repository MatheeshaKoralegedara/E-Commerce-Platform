
import AddToCartButton from '@/components/AddToCartButton';

async function getProduct(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return <main className="max-w-3xl mx-auto px-4 py-8">Product not found.</main>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-gray-600 mt-2">{product.description}</p>

      <div className="mt-6 space-y-4">
        {product.variants.map((variant) => (
          <div key={variant.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">
                {Object.entries(variant.attributes || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ') || variant.sku}
              </p>
              <p className="text-sm text-gray-500">
                {variant.stock_qty > 0 ? `${variant.stock_qty} in stock` : 'Out of stock'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">${(variant.price_cents / 100).toFixed(2)}</p>
              <AddToCartButton variantId={variant.id} stockQty={variant.stock_qty} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}