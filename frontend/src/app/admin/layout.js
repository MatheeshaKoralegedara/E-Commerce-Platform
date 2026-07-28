// frontend/src/app/admin/layout.js
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="font-display text-3xl mb-6">Dashboard</h1>
        <nav className="flex gap-1 mb-8 border-b border-[var(--color-line)]">
          {[
            ['Overview', '/admin'],
            ['Products', '/admin/products'],
            ['Orders', '/admin/orders'],
            ['Discount Codes', '/admin/discounts'],
            ['Categories', '/admin/categories'],
            ['Reviews', '/admin/reviews'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] border-b-2 border-transparent hover:border-[var(--color-ink)] transition-colors -mb-px"
            >
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </AdminGuard>
  );
}