import Link from 'next/link';

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`, { cache: 'no-store' });
  if (!res.ok) return { products: [] };
  return res.json();
}

export default async function PulseDemoPage() {
  const { products } = await getProducts();

  return (
    <main className="bg-[#0a0a0f] min-h-screen text-white">
      {/* Scrolling marquee banner */}
      <div className="bg-[#0ea5e9] py-2 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee">
          {Array(6).fill('⚡ FREE SHIPPING ON ORDERS OVER RS. 5,000 · NEW DROPS WEEKLY · LIMITED STOCK ⚡').map((text, i) => (
            <span key={i} className="mx-8 text-sm font-bold tracking-wide">{text}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 animate-mesh" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="animate-slide-bold inline-block mb-6 px-4 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 text-xs font-bold tracking-widest uppercase">
            New Season Drop
          </div>
          <h1 className="animate-slide-bold text-6xl md:text-8xl font-black leading-[0.95] mb-6 tracking-tight" style={{ animationDelay: '0.1s' }}>
            GEAR UP.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400">
              STAND OUT.
            </span>
          </h1>
          <p className="animate-slide-bold text-white/60 max-w-xl mx-auto mb-10 text-lg" style={{ animationDelay: '0.2s' }}>
            Bold pieces for people who don't blend in. Fresh drops, unbeatable prices, zero compromise.
          </p>
          <div className="animate-slide-bold flex flex-wrap justify-center gap-4" style={{ animationDelay: '0.3s' }}>
            <Link
              href="#products"
              className="animate-pulse-glow bg-cyan-500 hover:bg-cyan-400 transition-colors text-black font-bold px-8 py-4 rounded-full text-sm"
            >
              Shop Now →
            </Link>
            <Link
              href="#products"
              className="border-2 border-white/20 hover:border-white/50 transition-colors px-8 py-4 rounded-full text-sm font-bold"
            >
              View Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Product grid with diagonal accent */}
      <section id="products" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-black">TRENDING NOW</h2>
          <div className="hidden md:block h-px flex-1 mx-6 bg-gradient-to-r from-cyan-400/50 to-transparent" />
          <span className="text-cyan-400 text-sm font-bold">{products.length} ITEMS</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => {
            const variant = product.variants?.[0];
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-white/5 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm truncate">{product.name}</h3>
                  {variant && (
                    <p className="text-cyan-400 font-bold mt-1">
                      Rs. {(variant.price_cents / 100).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="absolute top-3 right-3 bg-fuchsia-500 text-white text-[10px] font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  NEW
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
