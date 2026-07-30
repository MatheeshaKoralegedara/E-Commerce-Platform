'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['Overview', '/admin'],
  ['Products', '/admin/products'],
  ['Orders', '/admin/orders'],
  ['Discount Codes', '/admin/discounts'],
  ['Categories', '/admin/categories'],
  ['Reviews', '/admin/reviews'],
  ['Audit Log', '/admin/audit-log'],
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 mb-8 overflow-x-auto scrollbar-none border-b border-[var(--color-line)]">
      {LINKS.map(([label, href]) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              active
                ? 'text-[var(--color-ink)] border-[var(--color-ink)]'
                : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-ink)] hover:border-[var(--color-line)]'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
