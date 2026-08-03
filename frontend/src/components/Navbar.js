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
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-canvas)]/90 backdrop-blur-md border-b border-[var(--color-line)]">
      <nav className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 font-display text-xl tracking-tight whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-full bg-[var(--color-pine-light)] flex items-center justify-center overflow-hidden ring-1 ring-[var(--color-line)]">
            <img src="/logo.png" alt="Mercato logo" className="w-full h-full object-cover" />
          </div>
          <span>Mercato</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-sm relative">
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field-input w-full rounded-full px-4 py-2 pr-9 text-sm"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-line)]/50 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div className="hidden md:flex items-center gap-5 text-sm whitespace-nowrap">
          <Link href="/cart" className="flex items-center gap-1.5 hover:text-[var(--color-pine)] transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Cart
          </Link>
          {loading ? null : user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="font-medium text-[var(--color-clay)] hover:text-[var(--color-clay-dark)] transition-colors">Admin</Link>
              )}
              <Link href="/wishlist" className="hover:text-[var(--color-pine)] transition-colors">Wishlist</Link>
              <Link href="/orders" className="hover:text-[var(--color-pine)] transition-colors">Orders</Link>
              <span className="text-[var(--color-muted)] hidden lg:inline">{user.email}</span>
              <Link href="/account">My Profile</Link>
              <button onClick={logout} className="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[var(--color-pine)] transition-colors">Login</Link>
              <Link href="/register" className="btn-primary btn text-sm rounded-full px-4 py-2">Register</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-line)]/50 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color-line)] px-6 py-4 space-y-4 animate-fade-up">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field-input w-full rounded-full px-4 py-2 text-sm"
            />
          </form>
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
            {loading ? null : user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="font-medium text-[var(--color-clay)]">Admin</Link>
                )}
                <Link href="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-[var(--color-muted)]">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary btn text-sm rounded-full px-4 py-2 w-fit">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
