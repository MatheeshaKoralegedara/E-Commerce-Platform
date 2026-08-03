
import AddToCartButton from '@/components/AddToCartButton';
import ReviewForm from '@/components/ReviewForm';
import StarRating from '@/components/ui/StarRating';
import { formatPrice } from '@/lib/format';
import ProductCard from '@/components/ProductCard';
import WishlistButton from '@/components/WishlistButton';

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
      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-2xl mb-2">Product not found</p>
        <p className="text-[var(--color-muted)]">It may have been removed or is no longer available.</p>
      </main>
    );
  }

  const reviewData = await getReviews(product.id);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-[var(--color-pine-light)] rounded-lg overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-sm">
              No image
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl md:text-4xl leading-tight">{product.name}</h1>
            <WishlistButton productId={product.id} />
          </div>

          {reviewData.reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={Number(reviewData.averageRating)} />
              <span className="text-sm text-[var(--color-muted)]">
                {reviewData.averageRating} · {reviewData.reviewCount} review{reviewData.reviewCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <p className="text-[var(--color-muted)] mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-8 space-y-3">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="card rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-sm">
                    {Object.entries(variant.attributes || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ') || variant.sku}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {variant.stock_qty > 0
                      ? variant.stock_qty <= 5
                        ? `Only ${variant.stock_qty} left`
                        : `${variant.stock_qty} in stock`
                      : 'Out of stock'}
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

      <section className="mt-20 pt-10 border-t border-[var(--color-line)] max-w-2xl">
        <p className="eyebrow mb-2">Reviews</p>
        <h2 className="font-display text-2xl mb-6">What people are saying</h2>

        <ReviewForm productId={product.id} />

        {reviewData.reviews.length === 0 ? (
          <p className="text-[var(--color-muted)] mt-6 text-sm">No reviews yet — be the first to share your thoughts.</p>
        ) : (
          <div className="mt-8 space-y-5">
            {reviewData.reviews.map((review) => (
              <div key={review.id} className="border-b border-[var(--color-line)] pb-5">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-[var(--color-muted)]">{review.masked_email}</span>
                </div>
                {review.comment && <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
        {product.related && product.related.length > 0 && (
            <section className="mt-16 pt-10 border-t border-[var(--color-line)]">
              <p className="eyebrow mb-2">You Might Also Like</p>
              <h2 className="font-display text-2xl mb-6">More from this collection</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {product.related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
              </div>
        </section>
)}
    </main>
  );
}
