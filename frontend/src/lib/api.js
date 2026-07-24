// frontend/src/lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // fetch throws (not resolves) when the network itself fails —
    // e.g. backend is down, no internet connection, CORS block
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