// frontend/src/app/admin/layout.js
import AdminGuard from '@/components/AdminGuard';
import AdminNav from '@/components/AdminNav';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="font-display text-3xl mb-6">Dashboard</h1>
        <AdminNav />
        <div className="animate-fade-up">{children}</div>
      </div>
    </AdminGuard>
  );
}
