const API_BASE = import.meta.env.VITE_API_URL || "/api"

const TOKEN_KEY = "erp_token"
const USER_KEY = "erp_user"

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null")
  } catch {
    return null
  }
}
export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user))
export const clearStoredUser = () => localStorage.removeItem(USER_KEY)

/**
 * Generic API request helper. Attaches JWT if available.
 */
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" }
  const authToken = token || getToken()
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: text }
  }

  if (!res.ok) {
    const err = new Error(data.message || `Request failed with status ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

// Auth helpers
export const loginStudent = (enrollmentId, password) =>
  apiRequest("/auth/student-login", { method: "POST", body: { enrollmentId, password } })

export const loginAdmin = (email, password, otp) =>
  apiRequest("/auth/admin-login", { method: "POST", body: { email, password, otp } })

export const sendOtp = (email, purpose = "Student Sign Up") =>
  apiRequest("/auth/send-otp", { method: "POST", body: { email, purpose } })

export const verifyOtp = (email, otp, purpose = "Student Sign Up") =>
  apiRequest("/auth/verify-otp", { method: "POST", body: { email, otp, purpose } })

export const signupStudent = (studentData) =>
  apiRequest("/auth/student-signup", { method: "POST", body: studentData })

export const fetchMe = (token) => apiRequest("/auth/me", { token })

export const logout = () => apiRequest("/auth/logout", { method: "POST" })