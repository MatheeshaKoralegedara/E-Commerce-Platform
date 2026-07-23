// frontend/src/app/admin/layout.js
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <nav className="flex gap-4 mb-8 border-b pb-4">
          <Link href="/admin/products" className="text-sm font-medium hover:underline">Products</Link>
          <Link href="/admin/orders" className="text-sm font-medium hover:underline">Orders</Link>
          <Link href="/admin/discounts" className="text-sm font-medium hover:underline">Discount Codes</Link>
          <Link href="/admin/categories" className="text-sm font-medium hover:underline">Categories</Link>
        </nav>
        {children}
      </div>
    </AdminGuard>
  );
}