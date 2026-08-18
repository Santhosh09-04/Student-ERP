import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Spinner } from "./Spinner"

/**
 * Route guard for protected pages.
 * @param {string} role - Required role ("student" | "admin")
 */
export const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    const loginPath = role === "admin" ? "/admin/login" : "/student/login"
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    // Role guard: redirect to that role's own dashboard
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace />
  }

  return children
}

export default ProtectedRoute