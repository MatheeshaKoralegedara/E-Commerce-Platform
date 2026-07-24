export function formatPrice(amount) {
  const rupees = Number(amount || 0);
  return `Rs. ${rupees.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}