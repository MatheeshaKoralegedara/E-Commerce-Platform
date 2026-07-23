// frontend/src/app/products/[slug]/page.js
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';

async function getProduct(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

async function getReviews(productId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews`, {
    cache: 'no-store',
  });
  if (!res.ok) return { reviewCount: 0, averageRating: '0.0', reviews: [] };
  return res.json();
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return <main className="max-w-3xl mx-auto px-4 py-8">Product not found.</main>;
  }

  const reviewData = await getReviews(product.id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{product.name}</h1>

      {reviewData.reviewCount > 0 && (
        <p className="text-sm text-gray-600 mt-1">
          ★ {reviewData.averageRating} ({reviewData.reviewCount} review{reviewData.reviewCount !== 1 ? 's' : ''})
        </p>
      )}

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

      {/* Reviews section */}
      <section className="mt-10 border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        <ReviewForm productId={product.id} />

        {reviewData.reviews.length === 0 ? (
          <p className="text-gray-500 mt-4">No reviews yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {reviewData.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className="text-sm text-gray-500">{review.user_email}</span>
                </div>
                {review.comment && <p className="mt-1 text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}