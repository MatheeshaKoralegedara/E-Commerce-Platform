export function Input({ label, error, className = '', wrapperClassName = '', id, ...props }) {
  return (
    <label className={`block ${wrapperClassName}`} htmlFor={id}>
      {label && <span className="text-sm font-medium block mb-1.5">{label}</span>}
      <input
        id={id}
        className={`field-input px-4 py-2.5 text-sm ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-[var(--color-danger)] text-xs mt-1 block">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, className = '', wrapperClassName = '', id, ...props }) {
  return (
    <label className={`block ${wrapperClassName}`} htmlFor={id}>
      {label && <span className="text-sm font-medium block mb-1.5">{label}</span>}
      <textarea
        id={id}
        className={`field-input px-4 py-2.5 text-sm ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-[var(--color-danger)] text-xs mt-1 block">{error}</span>}
    </label>
  );
}

export function Select({ label, error, className = '', wrapperClassName = '', id, children, ...props }) {
  return (
    <label className={`block ${wrapperClassName}`} htmlFor={id}>
      {label && <span className="text-sm font-medium block mb-1.5">{label}</span>}
      <select
        id={id}
        className={`field-input px-4 py-2.5 text-sm ${error ? 'border-[var(--color-danger)]' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-[var(--color-danger)] text-xs mt-1 block">{error}</span>}
    </label>
  );
}
