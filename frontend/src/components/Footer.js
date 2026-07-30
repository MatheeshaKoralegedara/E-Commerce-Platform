import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] mt-24 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-pine-light)] flex items-center justify-center overflow-hidden ring-1 ring-[var(--color-line)]">
                <img
                  src="/logo.png"
                  alt="Mercato logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-display text-lg">Mercato</p>
            </div>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-[220px]">
              Considered everyday goods, made to last.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-3">Shop</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">All products</Link></li>
              <li><Link href="/?category=shirts" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">Shirts</Link></li>
              <li><Link href="/?category=accessories" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">Accessories</Link></li>
              <li><Link href="/?category=footwear" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">Footwear</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">Account</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/orders" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">My orders</Link></li>
              <li><Link href="/cart" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">Cart</Link></li>
              <li><Link href="/login" className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">Log in</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-3">Support</p>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-[var(--color-muted)]">Shipping & returns</span></li>
              <li><span className="text-[var(--color-muted)]">Contact us</span></li>
              <li><span className="text-[var(--color-muted)]">FAQs</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-line)] flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[var(--color-muted)]">
          <p>© {new Date().getFullYear()} Mercato. All rights reserved.</p>
          <p>
            Design and Build by{' '}
            <a
              href="https://galacticweb.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-ink)] hover:underline"
            >
              Galactic Web
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
