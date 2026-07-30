export default function StarRating({ rating, size = 'text-sm', className = '' }) {
  const full = Math.round(rating);
  return (
    <span className={`${size} ${className}`} style={{ color: 'var(--color-clay)' }} aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(full)}
      <span style={{ color: 'var(--color-line)' }}>{'★'.repeat(5 - full)}</span>
    </span>
  );
}
