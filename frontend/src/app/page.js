// frontend/src/app/page.js
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

async function getProducts(categorySlug, sort, offset) {
  const params = new URLSearchParams();
  if (categorySlug) params.set('category', categorySlug);
  if (sort) params.set('sort', sort);
  params.set('offset', offset);
  params.set('limit', '12');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json(); // { products, total, limit, offset }
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
];

export default async function HomePage({ searchParams }) {
  const { category, sort = 'newest', page = '1' } = await searchParams;
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limit = 12;
  const offset = (pageNum - 1) * limit;

  const [{ products, total }, categories] = await Promise.all([
    getProducts(category, sort, offset),
    getCategories(),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  function pageUrl(newPage) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    params.set('page', newPage);
    return `/?${params}#collection`;
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-[var(--color-pine-dark)] text-[var(--color-canvas)]">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div
          className="absolute -top-32 -right-32 w-[26rem] h-[26rem] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'var(--color-clay)' }}
        />
        <div
          className="absolute -bottom-40 -left-24 w-[22rem] h-[22rem] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'var(--color-pine-light)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20 md:py-28 grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-12 items-center">
          <div className="animate-fade-up text-center md:text-left">
            <p className="eyebrow mb-4 justify-center md:justify-start inline-flex" style={{ color: 'var(--color-clay-light)' }}>The Collection · Est. 2024</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-6 text-balance">
              Everyday goods,<br />made to last.
            </h1>
            <p className="text-white/70 max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
              Considered essentials, sourced from makers who care about materials
              as much as you do. No trends — just things worth keeping.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href="#collection" className="btn btn-primary rounded-full px-6 py-3 text-sm shadow-lg shadow-black/20 hover:scale-[1.03] active:scale-[0.98] transition-transform" style={{ background: 'var(--color-clay)' }}>
                Shop the collection
              </Link>
              <a href="#collection" className="btn rounded-full px-6 py-3 text-sm border border-white/25 text-white hover:bg-white/10 hover:border-white/40 transition-colors">
                Browse categories
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 md:mt-0">
            {products.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                className={`aspect-square rounded-lg overflow-hidden ring-1 ring-white/10 shadow-xl shadow-black/20 ${i % 3 === 1 ? 'sm:mt-6' : ''}`}
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="collection" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-20">
        <div className="mb-8 sm:mb-10 flex flex-col gap-6">
          <div>
            <p className="eyebrow mb-2">Browse</p>
            <h2 className="section-heading font-display text-2xl sm:text-3xl">
              {category ? categories.find((c) => c.slug === category)?.name || 'Products' : 'All products'}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
              <Link
                href={`/?sort=${sort}#collection`}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  !category
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                    : 'border-[var(--color-line)] hover:border-[var(--color-ink)] bg-[var(--color-surface)]'
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.slug}&sort=${sort}#collection`}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    category === cat.slug
                      ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                      : 'border-[var(--color-line)] hover:border-[var(--color-ink)] bg-[var(--color-surface)]'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <form action="/" method="get" className="flex items-center gap-2 shrink-0">
              {category && <input type="hidden" name="category" value={category} />}
              <label htmlFor="sort" className="text-xs text-[var(--color-muted)] shrink-0">Sort</label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="border border-[var(--color-line)] rounded-md px-3 py-1.5 text-sm bg-[var(--color-surface)] flex-1 md:flex-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button type="submit" className="text-xs underline underline-offset-2 text-[var(--color-muted)] shrink-0">
                Apply
              </button>
            </form>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title="No products found"
            description={category ? 'Nothing in this category yet — check back soon.' : 'The shelves are empty right now.'}
            action={category ? <Link href="/" className="btn btn-secondary rounded-full px-5 py-2 text-sm">View all products</Link> : null}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 sm:mt-12">
                <Link
                  href={pageUrl(pageNum - 1)}
                  aria-disabled={pageNum <= 1}
                  className={`px-3 py-2 sm:py-1.5 rounded-md text-sm border border-[var(--color-line)] ${pageNum <= 1 ? 'pointer-events-none opacity-30' : 'hover:border-[var(--color-ink)]'}`}
                >
                  Previous
                </Link>
                <span className="text-sm text-[var(--color-muted)] px-2 whitespace-nowrap">
                  Page {pageNum} of {totalPages}
                </span>
                <Link
                  href={pageUrl(pageNum + 1)}
                  aria-disabled={pageNum >= totalPages}
                  className={`px-3 py-2 sm:py-1.5 rounded-md text-sm border border-[var(--color-line)] ${pageNum >= totalPages ? 'pointer-events-none opacity-30' : 'hover:border-[var(--color-ink)]'}`}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}