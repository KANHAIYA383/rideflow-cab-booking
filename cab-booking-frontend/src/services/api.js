
const API_BASE_URL = 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export const api = {
  get: (path) => request(path),

  post: (path, data) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (path, data) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (path) =>
    request(path, {
      method: 'DELETE',
    }),
}
