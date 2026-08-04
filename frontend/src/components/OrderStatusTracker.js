// frontend/src/components/OrderStatusTracker.js
function buildSteps(paymentMethod) {
  return [
    { key: 'pending', label: 'Order Placed' },
    { key: 'paid', label: paymentMethod === 'cod' ? 'Order Confirmed' : 'Payment Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];
}

const TERMINAL_STATES = {
  cancelled: { label: 'Order Cancelled', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'warning' },
  disputed: { label: 'Payment Disputed', tone: 'danger' },
};

export default function OrderStatusTracker({ status, paymentMethod }) {
  const STEPS = buildSteps(paymentMethod);
  // Cancelled/refunded/disputed don't fit the linear flow — show a distinct banner instead
  if (TERMINAL_STATES[status]) {
    const terminal = TERMINAL_STATES[status];
    return (
      <div
        className="rounded-md p-4 text-center text-sm font-medium"
        style={{
          background: terminal.tone === 'danger' ? '#fef2f2' : terminal.tone === 'warning' ? '#fffbeb' : '#f5f5f4',
          color: terminal.tone === 'danger' ? '#991b1b' : terminal.tone === 'warning' ? '#92400e' : '#57534e',
        }}
      >
        {terminal.label}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center w-full py-4">
      {STEPS.map((step, i) => {
        const isComplete = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors"
                style={{
                  background: isComplete ? 'var(--color-pine)' : 'var(--color-line)',
                  color: isComplete ? 'white' : 'var(--color-muted)',
                }}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isComplete ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs text-center whitespace-nowrap ${isCurrent ? 'font-medium' : ''}`}
                style={{ color: isComplete ? 'var(--color-ink)' : 'var(--color-muted)' }}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className="flex-1 h-0.5 mx-2 mb-5 transition-colors"
                style={{ background: i < currentIndex ? 'var(--color-pine)' : 'var(--color-line)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
