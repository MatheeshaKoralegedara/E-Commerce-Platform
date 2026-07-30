const TONES = {
  neutral: { background: 'var(--color-line)', color: 'var(--color-ink)' },
  pine: { background: 'var(--color-pine-light)', color: 'var(--color-pine-dark)' },
  clay: { background: 'var(--color-clay-light)', color: 'var(--color-clay-dark)' },
  danger: { background: 'var(--color-danger-light)', color: 'var(--color-danger)' },
  warning: { background: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  info: { background: '#E4EBF5', color: '#33517D' },
};

export const ORDER_STATUS_TONE = {
  pending: 'warning',
  paid: 'info',
  shipped: 'clay',
  delivered: 'pine',
  cancelled: 'danger',
};

export default function Badge({ tone = 'neutral', children, className = '' }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      className={`badge ${className}`}
      style={{ background: t.background, color: t.color }}
    >
      {children}
    </span>
  );
}
