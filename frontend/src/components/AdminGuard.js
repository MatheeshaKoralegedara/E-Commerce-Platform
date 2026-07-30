
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <main className="max-w-3xl mx-auto px-6 py-24 text-center text-[var(--color-muted)] text-sm">
        Checking access…
      </main>
    );
  }

  return children;
}