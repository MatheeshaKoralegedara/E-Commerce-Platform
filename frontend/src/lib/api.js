const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest(path, { method = 'GET', body, token } = {}) {
    const headers = {'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ${token}';

    const res = await fetch('${API_URL}${path}',{
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,

    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

export default apiRequest;