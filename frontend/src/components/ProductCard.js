import Link from 'next/link';
import { formatPrice } from '@/lib/format';

export default function ProductCard({ product }) {
  const firstVariant = product.variants[0];
  const inStock = product.variants.some((v) => v.stock_qty > 0);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-product rounded-lg overflow-hidden group flex flex-col"
    >
      <div className="aspect-square bg-[var(--color-pine-light)] overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)] text-sm">
            No image
          </div>
        )}
        {!inStock && (
          <span className="absolute top-3 left-3 badge bg-[var(--color-ink)] text-[var(--color-canvas)]" style={{ background: 'var(--color-ink)', color: 'var(--color-canvas)' }}>
            Sold out
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h2 className="font-display text-lg leading-snug">{product.name}</h2>
        <p className="text-[var(--color-muted)] text-sm mt-1 line-clamp-1">{product.description}</p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          {firstVariant && (
            <p className="font-medium">{formatPrice(firstVariant.price_cents)}</p>
          )}
          <span className="text-sm text-[var(--color-clay)] opacity-0 group-hover:opacity-100 transition-opacity">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
