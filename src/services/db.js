// API helper for database-backed endpoints
// Automatically attaches JWT token from localStorage

function getHeaders() {
  const headers = { "Content-Type": "application/json" }
  const token = localStorage.getItem("av_token")
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function apiGet(path) {
  const res = await fetch(path, { headers: getHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}

export async function apiPut(path, body) {
  const res = await fetch(path, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}

export async function apiDelete(path, body) {
  const res = await fetch(path, {
    method: "DELETE",
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}
