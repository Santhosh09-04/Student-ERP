import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { sendOtp } from "../utils/api"
import { Spinner } from "../components/Spinner"

const classesList = [
  "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
  "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade",
  "11th Grade", "12th Grade"
]
const sectionsList = ["A", "B", "C", "D"]

export const StudentSignup = () => {
  const [step, setStep] = useState(1) // 1: Info Form, 2: OTP Verification
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    class: "10th Grade",
    section: "A",
    contact: "",
    rollNo: "",
  })
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  const { signup } = useAuth()
  const navigate = useNavigate()

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError("")
  }

  // Step 1: Send OTP to student email
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!form.name.trim()) return setError("Please enter your full name.")
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setError("Please enter a valid email address.")
    }
    if (!form.password || form.password.length < 8) {
      return setError("Password must be at least 8 characters long.")
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.")
    }
    if (!form.class) return setError("Please select your class.")

    setSendingOtp(true)
    try {
      await sendOtp(form.email.trim(), "Student Sign Up")
      setSuccessMsg(`Verification code sent to ${form.email.trim()}`)
      setStep(2)
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.")
    } finally {
      setSendingOtp(false)
    }
  }

  // Step 2: Complete Sign Up with OTP
  const handleVerifyAndSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (!otp.trim() || otp.trim().length < 6) {
      return setError("Please enter the 6-digit OTP code sent to your email.")
    }

    setSubmitting(true)
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        class: form.class,
        section: form.section,
        contact: form.contact.trim(),
        rollNo: form.rollNo.trim(),
        otp: otp.trim(),
      })
      navigate("/student/dashboard", { replace: true })
    } catch (err) {
      setError(err.message || "Verification failed. Please check the code.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    setError("")
    setSuccessMsg("")
    setSendingOtp(true)
    try {
      await sendOtp(form.email.trim(), "Student Sign Up")
      setSuccessMsg(`Resent OTP verification code to ${form.email.trim()}`)
    } catch (err) {
      setError(err.message || "Failed to resend OTP.")
    } finally {
      setSendingOtp(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Student Sign Up</h2>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 ? "Create your student account with email OTP verification" : "Enter the verification code sent to your email"}
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === 1 ? "text-indigo-600" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>1</span>
              Student Details
            </div>
            <div className="w-8 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === 2 ? "text-indigo-600" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>2</span>
              Email Verification
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Registration Info */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Class *</label>
                  <select
                    value={form.class}
                    onChange={(e) => setField("class", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {classesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                  <select
                    value={form.section}
                    onChange={(e) => setField("section", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {sectionsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={(e) => setField("contact", e.target.value)}
                    placeholder="e.g. 555-0199"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll No (Optional)</label>
                  <input
                    type="text"
                    value={form.rollNo}
                    onChange={(e) => setField("rollNo", e.target.value)}
                    placeholder="e.g. 101"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setField("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {sendingOtp && <Spinner size="sm" />}
                {sendingOtp ? "Sending OTP..." : "Send Email OTP Code →"}
              </button>
            </form>
          )}

              {/* STEP 2: OTP Entry */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndSignup} className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                <p className="text-xs text-indigo-700 font-medium">OTP Code sent to:</p>
                <p className="font-semibold text-slate-800 text-base">{form.email}</p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 hover:underline mt-1 font-medium"
                >
                  Change Email Address
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                  Enter 6-digit OTP Verification Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center font-mono text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  disabled={sendingOtp}
                  onClick={handleResendOtp}
                  className="text-indigo-600 hover:underline font-medium disabled:opacity-50"
                >
                  {sendingOtp ? "Resending..." : "Resend OTP"}
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && <Spinner size="sm" />}
                {submitting ? "Verifying..." : "Verify OTP & Complete Registration"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/student/login" className="text-indigo-600 hover:underline font-medium">
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentSignup
