import React, { useState } from "react"
import { apiRequest } from "../utils/api"
import { Spinner } from "./Spinner"

export const ForgotPasswordModal = ({ isOpen, onClose, defaultRole = "student" }) => {
  const [step, setStep] = useState(1) // 1: Request OTP, 2: Reset Password, 3: Success
  const [role, setRole] = useState(defaultRole)
  const [identifier, setIdentifier] = useState("")
  const [email, setEmail] = useState("")
  const [maskedEmail, setMaskedEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  if (!isOpen) return null

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!identifier.trim()) {
      setError(`Please enter your ${role === "student" ? "Enrollment ID or Email" : "Admin Email"}`)
      return
    }

    setLoading(true)
    try {
      const res = await apiRequest("/auth/forgot-password/send-otp", {
        method: "POST",
        body: { identifier: identifier.trim(), role },
      })

      setEmail(res.email)
      setMaskedEmail(res.maskedEmail || res.email)
      setSuccessMsg(res.message || `Verification code sent to ${res.maskedEmail || res.email}`)
      setStep(2)
    } catch (err) {
      setError(err.message || "Failed to send reset code. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!otp.trim() || otp.trim().length < 6) {
      setError("Please enter the 6-digit verification code sent to your email.")
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.")
      return
    }

    setLoading(true)
    try {
      const res = await apiRequest("/auth/forgot-password/reset", {
        method: "POST",
        body: {
          email,
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        },
      })


      setSuccessMsg(res.message || "Password reset successfully!")
      setStep(3)
    } catch (err) {
      setError(err.message || "Failed to reset password. Invalid or expired OTP.")
    } finally {
      setLoading(false)
    }
  }

  const resetModalState = () => {
    setStep(1)
    setIdentifier("")
    setEmail("")
    setMaskedEmail("")
    setOtp("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccessMsg("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 relative">
        
        {/* Close Button */}
        <button
          onClick={resetModalState}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Forgot Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {step === 1 && "Send a 6-digit OTP code to your registered email"}
            {step === 2 && `Enter OTP code sent to ${maskedEmail}`}
            {step === 3 && "Your password has been changed successfully!"}
          </p>
        </div>

        {/* Role Selector Tabs (Only on Step 1) */}
        {step === 1 && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => { setRole("student"); setError("") }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === "student"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🎓 Student Account
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError("") }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                role === "admin"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🛡️ Admin Account
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && step !== 3 && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {/* STEP 1: Enter Identifier */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {role === "student" ? "Registered Email or Enrollment ID *" : "Admin Email Address *"}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError("") }}
                placeholder={role === "student" ? "e.g. STD-2024-001 or student@example.com" : "admin@student.edu"}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
            >
              {loading && <Spinner size="sm" />}
              {loading ? "Sending Verification Code..." : "Send Verification Code →"}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-center">
                6-Digit OTP Code *
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError("") }}
                placeholder="123456"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError("") }}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError("") }}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
            >
              {loading && <Spinner size="sm" />}
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
              {successMsg || "Your password has been reset successfully!"}
            </p>
            <button
              type="button"
              onClick={resetModalState}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal
