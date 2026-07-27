
export function formatPrice(cents) {
  const rupees = Number(cents || 0) / 100;
  return `Rs. ${rupees.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}