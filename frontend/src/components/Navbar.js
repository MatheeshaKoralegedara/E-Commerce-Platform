
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="border-b px-4 py-3 flex justify-between items-center">
      <Link href="/" className="font-bold text-lg">My Store</Link>
      <div className="flex gap-4 items-center">
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