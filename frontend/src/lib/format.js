export function formatPrice(cents) {
  const rupees = cents / 100;
  return `Rs. ${rupees.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}