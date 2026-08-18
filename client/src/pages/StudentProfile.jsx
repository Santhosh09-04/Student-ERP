import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { apiRequest } from "../utils/api"

export const StudentProfile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    enrollmentId: user?.enrollmentId || "",
    class: user?.class || "",
    section: user?.section || "",
    contact: user?.contact || "",
    address: user?.address || "",
    photoUrl: user?.photoUrl || "",
  })

  useEffect(() => {
    let cancelled = false
    apiRequest("/students/profile")
      .then((data) => {
        if (!cancelled && data) {
          setFormData((prev) => ({
            ...prev,
            contact: data.contact || prev.contact,
            address: data.address || prev.address,
            class: data.class || prev.class,
            section: data.section || prev.section,
            enrollmentId: data.enrollmentId || prev.enrollmentId,
            photoUrl: data.photoUrl || prev.photoUrl || user?.photoUrl || "",
          }))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle Image File Browsing & Conversion to Base64
  const handleImageBrowse = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file (PNG, JPG, JPEG, WebP)." })
      return
    }

    // Limit size to ~3MB
    if (file.size > 3 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size is too large. Please select an image under 3MB." })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result }))
      setMessage({ type: "success", text: "Photo selected! Click 'Save Profile Options' to apply." })
    }
    reader.onerror = () => {
      setMessage({ type: "error", text: "Failed to read selected image file." })
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photoUrl: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
    setMessage({ type: "success", text: "Photo removed. Click 'Save Profile Options' to update." })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const res = await apiRequest("/students/profile", {
        method: "PUT",
        body: {
          name: formData.name,
          contact: formData.contact,
          address: formData.address,
          photoUrl: formData.photoUrl,
        },
      })

      if (res.user) {
        updateUser(res.user)
      }
      setMessage({ type: "success", text: res.message || "Profile updated successfully!" })
      setIsEditing(false)
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." })
    } finally {
      setLoading(false)
    }
  }

  const initials = (formData.name || user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="max-w-4xl space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageBrowse}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information, contact details, and profile photo.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing)
            setMessage({ type: "", text: "" })
          }}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
            isEditing
              ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isEditing ? (
            <>Cancel Editing</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile Options
            </>
          )}
        </button>
      </div>

      {/* Alert message */}
      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        {/* Profile Avatar & Quick Info Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
          
          {/* Profile Picture Box */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none overflow-hidden border-2 border-indigo-500/20">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Upload Badge overlay when editing or clicking */}
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Click to browse & change profile picture"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Change Photo
              </button>
            )}
          </div>

          <div className="text-center sm:text-left space-y-2 flex-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{formData.name}</h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
              {formData.class ? `${formData.class}${formData.section ? ` · Section ${formData.section}` : ""}` : "Student"}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Enrollment ID: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{formData.enrollmentId || user?.enrollmentId || "STD-2026-006"}</span>
            </p>

            {/* Photo Action Buttons */}
            {isEditing && (
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Browse Computer Photo
                </button>

                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-200 font-medium text-base py-2">{formData.name || "—"}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <p className="text-slate-800 dark:text-slate-200 font-medium text-base py-2">{formData.email || user?.email || "—"}</p>
            </div>

            {/* Enrollment ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Enrollment ID
              </label>
              <p className="text-slate-800 dark:text-slate-200 font-mono font-medium text-base py-2">
                {formData.enrollmentId || user?.enrollmentId || "—"}
              </p>
            </div>

            {/* Class & Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Class & Section
              </label>
              <p className="text-slate-800 dark:text-slate-200 font-medium text-base py-2">
                {formData.class ? `${formData.class}${formData.section ? ` - ${formData.section}` : ""}` : "—"}
              </p>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Phone / Contact Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-200 font-medium text-base py-2">{formData.contact || "Not provided"}</p>
              )}
            </div>

            {/* Residential Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Residential Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-200 font-medium text-base py-2">{formData.address || "Not provided"}</p>
              )}
            </div>
          </div>

          {/* Action Save Button when Editing */}
          {isEditing && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-none disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving Changes..." : "Save Profile Options"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default StudentProfile