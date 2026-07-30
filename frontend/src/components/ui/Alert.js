const TONES = {
  danger: { bg: 'var(--color-danger-light)', color: 'var(--color-danger)' },
  success: { bg: 'var(--color-pine-light)', color: 'var(--color-pine-dark)' },
  warning: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
};

export default function Alert({ tone = 'danger', children, className = '' }) {
  if (!children) return null;
  const t = TONES[tone] || TONES.danger;
  return (
    <div
      className={`text-sm rounded-md px-4 py-3 flex items-start gap-2 ${className}`}
      style={{ background: t.bg, color: t.color }}
    >
      <span aria-hidden="true" className="leading-none mt-0.5">
        {tone === 'success' ? '✓' : tone === 'warning' ? '!' : '⨯'}
      </span>
      <span>{children}</span>
    </div>
  );
}
