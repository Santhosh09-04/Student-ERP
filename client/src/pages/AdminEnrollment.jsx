import React, { useState, useRef } from "react"
import { apiRequest } from "../utils/api"
import { Spinner } from "../components/Spinner"

const classes = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"]
const sections = ["A", "B", "C", "D"]

export const AdminEnrollment = () => {
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    class: "",
    section: "A",
    contact: "",
    address: "",
    photoUrl: "",
    dateOfJoining: new Date().toISOString().split("T")[0],
  })
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState("")

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: "" }))
  }

  const handlePhotoBrowse = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setApiError("Please select a valid image file (PNG, JPG, JPEG, WebP).")
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setApiError("Image size is too large. Select an image under 3MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setField("photoUrl", reader.result)
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Student name is required"
    if (!form.class) e.class = "Please select a class"
    if (form.contact && !/^[\d+\-() ]{7,20}$/.test(form.contact.trim())) e.contact = "Enter a valid phone number"
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setApiError("")
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    try {
      const data = await apiRequest("/admin/students", { method: "POST", body: form })
      setResult(data)
      setForm({
        name: "",
        rollNo: "",
        class: "",
        section: "A",
        contact: "",
        address: "",
        photoUrl: "",
        dateOfJoining: new Date().toISOString().split("T")[0],
      })
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = (key) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 dark:text-white bg-white dark:bg-slate-800 dark:border-slate-700 text-sm ${
      errors[key] ? "border-red-400 dark:border-red-500" : "border-slate-300"
    }`

  return (
    <div className="max-w-2xl space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoBrowse}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Enrollment</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Enroll a new student. An enrollment ID and default password are generated automatically.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm">{apiError}</div>
      )}

      {result && (
        <div className="p-5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Student enrolled successfully</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <p className="text-green-700 dark:text-green-400">Name: <span className="font-medium">{result.student?.name || form.name}</span></p>
            <p className="text-green-700 dark:text-green-400">Enrollment ID: <span className="font-mono font-medium">{result.credentials?.enrollmentId}</span></p>
            <p className="text-green-700 dark:text-green-400">Default password: <span className="font-mono font-medium">{result.credentials?.defaultPassword}</span></p>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-3">
            Share these credentials with the student. They can change their password after first login.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Photo Selection Row */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="Student preview" className="w-full h-full object-cover" />
            ) : (
              <span>📷</span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">Student Photo (Optional)</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold cursor-pointer transition-colors"
            >
              {form.photoUrl ? "Change Photo" : "Browse Student Photo"}
            </button>
            {form.photoUrl && (
              <button
                type="button"
                onClick={() => setField("photoUrl", "")}
                className="ml-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Student name *</label>
            <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputCls("name")} placeholder="Full name" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Roll number</label>
            <input type="text" value={form.rollNo} onChange={(e) => setField("rollNo", e.target.value)} className={inputCls("rollNo")} placeholder="e.g. 101" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Class *</label>
            <select value={form.class} onChange={(e) => setField("class", e.target.value)} className={inputCls("class")}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.class && <p className="text-xs text-red-500 mt-1">{errors.class}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Section</label>
            <select value={form.section} onChange={(e) => setField("section", e.target.value)} className={inputCls("section")}>
              {sections.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Contact number</label>
            <input type="tel" value={form.contact} onChange={(e) => setField("contact", e.target.value)} className={inputCls("contact")} placeholder="e.g. 555-1234" />
            {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Date of joining</label>
            <input type="date" value={form.dateOfJoining} onChange={(e) => setField("dateOfJoining", e.target.value)} className={inputCls("dateOfJoining")} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Address</label>
          <textarea value={form.address} onChange={(e) => setField("address", e.target.value)} rows={3} className={inputCls("address")} placeholder="Residential address" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, name: "", rollNo: "", class: "", contact: "", address: "", photoUrl: "" })}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
          >
            {submitting && <Spinner size="sm" />}
            Enroll Student
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminEnrollment