
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';
import { formatPrice } from '@/lib/format';

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
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[var(--color-muted)]">Product not found.</p>
      </main>
    );
  }

  const reviewData = await getReviews(product.id);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-[var(--color-line)]/40 rounded-md overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-sm">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl">{product.name}</h1>

          {reviewData.reviewCount > 0 && (
            <p className="text-sm text-[var(--color-muted)] mt-2">
              <span className="text-[var(--color-clay)]">★</span> {reviewData.averageRating}
              <span className="mx-1">·</span>
              {reviewData.reviewCount} review{reviewData.reviewCount !== 1 ? 's' : ''}
            </p>
          )}

          <p className="text-[var(--color-muted)] mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-8 space-y-3">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="border border-[var(--color-line)] rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-sm">
                    {Object.entries(variant.attributes || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ') || variant.sku}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {variant.stock_qty > 0 ? `${variant.stock_qty} in stock` : 'Out of stock'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium mb-2">{formatPrice(variant.price_cents)}</p>
                  <AddToCartButton variantId={variant.id} stockQty={variant.stock_qty} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16 pt-10 border-t border-[var(--color-line)] max-w-2xl">
        <p className="eyebrow mb-2">Reviews</p>
        <h2 className="font-display text-2xl mb-6">What people are saying</h2>

        <ReviewForm productId={product.id} />

        {reviewData.reviews.length === 0 ? (
          <p className="text-[var(--color-muted)] mt-6 text-sm">No reviews yet.</p>
        ) : (
          <div className="mt-8 space-y-5">
            {reviewData.reviews.map((review) => (
              <div key={review.id} className="border-b border-[var(--color-line)] pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-clay)] text-sm">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">{review.user_email}</span>
                </div>
                {review.comment && <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}