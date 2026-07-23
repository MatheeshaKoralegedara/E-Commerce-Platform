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
    <nav className="border-b px-4 py-3 flex justify-between items-center gap-4">
      <Link href="/" className="font-bold text-lg whitespace-nowrap">My Store</Link>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </form>

      <div className="flex gap-4 items-center whitespace-nowrap">
        <Link href="/cart">Cart</Link>
        {loading ? null : user ? (
          <>
            <Link href="/orders">My Orders</Link>
            <span className="text-sm text-gray-500">{user.email}</span>
            <button onClick={logout} className="text-sm underline">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}