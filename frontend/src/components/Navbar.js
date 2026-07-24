// frontend/src/components/Navbar.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-canvas)]/95 backdrop-blur border-b border-[var(--color-line)]">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl tracking-tight whitespace-nowrap">
          My Store
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-[var(--color-line)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] transition-colors"
          />
        </form>

        <div className="flex items-center gap-5 text-sm whitespace-nowrap">
          <Link href="/cart" className="hover:text-[var(--color-pine)] transition-colors">Cart</Link>
          {loading ? null : user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin/products" className="text-[var(--color-clay)] font-medium hover:opacity-80">
                  Admin
                </Link>
              )}
              <Link href="/orders" className="hover:text-[var(--color-pine)] transition-colors">Orders</Link>
              <span className="text-[var(--color-muted)] hidden sm:inline">{user.email}</span>
              <button onClick={logout} className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[var(--color-pine)] transition-colors">Login</Link>
              <Link href="/register" className="btn-primary rounded-full px-4 py-2">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}