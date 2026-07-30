'use client';

import { useEffect, useState } from 'react';
import apiRequest from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

const ACTION_LABELS = {
  'product.status_changed': 'Changed product status',
  'product.updated': 'Edited product',
  'order.status_changed': 'Changed order status',
  'review.removed': 'Removed review',
  'category.deleted': 'Deleted category',
  'discount.created': 'Created discount code',
  'discount.updated': 'Updated discount code',
};

export default function AuditLogPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest('/audit-log', { token });
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-[var(--color-muted)] text-sm">Loading audit log…</p>;

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Audit Log</h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {logs.length === 0 ? (
        <p className="text-[var(--color-muted)] text-sm">No admin actions recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="border-b border-[var(--color-line)] py-3 flex justify-between text-sm">
              <div>
                <span className="font-medium">{ACTION_LABELS[log.action] || log.action}</span>
                <span className="text-[var(--color-muted)]"> · {log.entity_type} #{log.entity_id}</span>
                {Object.keys(log.details || {}).length > 0 && (
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {JSON.stringify(log.details)}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-[var(--color-muted)]">
                <p>{log.admin_email}</p>
                <p>{new Date(log.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}