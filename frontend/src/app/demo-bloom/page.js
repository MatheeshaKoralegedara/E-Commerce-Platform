import Link from 'next/link';

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`, { cache: 'no-store' });
  if (!res.ok) return { products: [] };
  return res.json();
}

export default async function BloomDemoPage() {
  const { products } = await getProducts();

  return (
    <main className="bg-[#fef9f5] min-h-screen text-[#4a3f3a]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Floating soft blobs */}
        <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-[#fbd0d9] opacity-50 blur-2xl animate-blob-1" />
        <div className="absolute top-20 right-[15%] w-72 h-72 rounded-full bg-[#c9e4de] opacity-50 blur-2xl animate-blob-2" />
        <div className="absolute bottom-0 left-[35%] w-56 h-56 rounded-full bg-[#fde8c8] opacity-50 blur-2xl animate-blob-3" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="animate-pop-in inline-block mb-6 px-5 py-2 rounded-full bg-white shadow-sm text-sm font-medium text-[#c9848f]">
            🌸 New arrivals, just for you
          </div>
          <h1 className="animate-pop-in text-5xl md:text-7xl font-semibold leading-tight mb-6" style={{ animationDelay: '0.1s' }}>
            Little things,<br />
            <span className="text-[#c9848f]">big joy.</span>
          </h1>
          <p className="animate-pop-in text-[#8a7b74] max-w-lg mx-auto mb-10 text-lg leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Gentle essentials for everyday moments — thoughtfully made,
            softly priced, and just a little bit delightful.
          </p>
          <div className="animate-pop-in flex flex-wrap justify-center gap-4" style={{ animationDelay: '0.3s' }}>
            <Link
              href="#products"
              className="bg-[#c9848f] hover:bg-[#b8717c] transition-colors text-white font-medium px-8 py-4 rounded-full text-sm shadow-lg shadow-[#c9848f]/30"
            >
              Start browsing
            </Link>
            <Link
              href="#products"
              className="bg-white hover:bg-[#fdf5f6] transition-colors px-8 py-4 rounded-full text-sm font-medium shadow-sm"
            >
              See what's new
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center mt-16 animate-gentle-bounce">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9848f" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* Product grid */}
      <section id="products" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-[#c9848f] mb-2">Shop the collection</p>
          <h2 className="text-3xl md:text-4xl font-semibold">Made with care</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const variant = product.variants?.[0];
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-[#fdf5f6] overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c9a8ae] text-sm">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  {variant && (
                    <p className="text-[#c9848f] font-semibold mt-1">
                      Rs. {(variant.price_cents / 100).toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
