// frontend/src/lib/api.js
import { getGuestToken } from './guestToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (path.startsWith('/cart')) {
    // Only attach a guest token for cart endpoints, which support anonymous use
    headers['X-Guest-Token'] = getGuestToken();
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Unable to reach the server. Please check your connection and try again.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Received an unexpected response from the server.');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export default apiRequest;