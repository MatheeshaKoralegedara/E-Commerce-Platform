export function getGuestToken() {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('guestToken');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('guestToken', token);
  }
  return token;
}

export function clearGuestToken() {
  localStorage.removeItem('guestToken');
}