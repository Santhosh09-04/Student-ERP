import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  loginStudent as apiLoginStudent,
  loginAdmin as apiLoginAdmin,
  signupStudent as apiSignupStudent,
  fetchMe,
  logout as apiLogout,
} from "../utils/api"

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser())
  const [token, setTokenState] = useState(getToken())
  const [loading, setLoading] = useState(Boolean(getToken()))

  // On mount, if a token exists, validate it via /auth/me
  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      const storedToken = getToken()
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        const data = await fetchMe(storedToken)
        if (!cancelled) {
          setUser(data.user)
          setStoredUser(data.user)
        }
      } catch {
        if (!cancelled) {
          clearToken()
          clearStoredUser()
          setUser(null)
          setTokenState(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    bootstrap()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async ({ role, identifier, password, otp }) => {
    const data =
      role === "admin"
        ? await apiLoginAdmin(identifier, password, otp)
        : await apiLoginStudent(identifier, password)

    if (data && data.requireOtp) {
      return data
    }

    setToken(data.token)
    setStoredUser(data.user)
    setUser(data.user)
    setTokenState(data.token)
    return data
  }, [])

  const signup = useCallback(async (studentData) => {
    const data = await apiSignupStudent(studentData)
    setToken(data.token)
    setStoredUser(data.user)
    setUser(data.user)
    setTokenState(data.token)
    return data
  }, [])

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedUserData }
      setStoredUser(newUser)
      return newUser
    })
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // ignore network errors during logout
    }
    clearToken()
    clearStoredUser()
    setUser(null)
    setTokenState(null)
  }, [])

  const value = { user, token, loading, isAuthenticated: Boolean(user), login, signup, logout, updateUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}