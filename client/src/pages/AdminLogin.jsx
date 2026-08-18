import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { Spinner, ForgotPasswordModal } from "../components"

export const AdminLogin = () => {
  const [step, setStep] = useState(1) // 1: Email/Password, 2: OTP Verification
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)

  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // Step 1: Check Email & Password, Request OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!email.trim() || !password) {
      return setError("Please enter your email and password.")
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Please enter a valid email address.")
    }

    setSubmitting(true)
    try {
      // First attempt to verify credentials & request OTP
      const res = await login({ role: "admin", identifier: email.trim(), password })
      if (res && res.requireOtp) {
        setSuccessMsg(res.message || `Verification code sent to ${email.trim()}`)
        setStep(2)
      } else {
        // Logged in directly if server returned token
        navigate("/admin/dashboard", { replace: true })
      }
    } catch (err) {
      setError(err.message || "Invalid admin credentials. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: Verify OTP code & Complete Login
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!otp.trim() || otp.trim().length < 6) {
      return setError("Please enter the 6-digit verification code sent to your email.")
    }

    setSubmitting(true)
    try {
      await login({ role: "admin", identifier: email.trim(), password, otp: otp.trim() })
      navigate("/admin/dashboard", { replace: true })
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    setError("")
    setSuccessMsg("")
    setSubmitting(true)
    try {
      const res = await login({ role: "admin", identifier: email.trim(), password })
      if (res && res.message) {
        setSuccessMsg(res.message)
      }
    } catch (err) {
      setError(err.message || "Failed to resend OTP code.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8">
          
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
              ← Back to home
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-200 dark:border-indigo-800">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 font-medium">
              {step === 1 ? "Administrative access with 2-Step Email Verification" : "Enter the verification code sent to your admin email"}
            </p>
          </div>

          {/* Stepper Header */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 1 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>1</span>
              Credentials
            </div>
            <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-800"></div>
            <div className={`flex items-center gap-2 text-xs font-bold ${step === 2 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>2</span>
              Email Verification
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Email & Password */}
          {step === 1 && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wider">
                  Admin Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  placeholder="admin@student.edu"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  autoComplete="username"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
              >
                {submitting && <Spinner size="sm" />}
                {submitting ? "Verifying Credentials..." : "Continue to Verification →"}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Entry */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl text-center">
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">Verification Code sent to:</p>
                <p className="font-bold text-slate-900 dark:text-white text-base">{email}</p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 font-bold cursor-pointer"
                >
                  Change Email / Password
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 text-center uppercase tracking-wider">
                  Enter 6-digit OTP Verification Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""))
                    setError("")
                  }}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-center font-mono text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 font-medium">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleResendOtp}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Resending..." : "Resend OTP"}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
              >
                {submitting && <Spinner size="sm" />}
                {submitting ? "Verifying OTP..." : "Verify OTP & Access Admin Portal"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-slate-600 dark:text-slate-300 font-medium">
          Demo admin credentials: <code className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">admin@student.edu</code> /{" "}
          <code className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">Admin@123</code>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        defaultRole="admin"
      />
    </div>
  )
}

export default AdminLogin