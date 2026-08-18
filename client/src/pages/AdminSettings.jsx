import React, { useState, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import { apiRequest } from "../utils/api"
import { Spinner } from "../components"

export const AdminSettings = () => {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || "Administrator")
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" })

  // Password Form state
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [pwdError, setPwdError] = useState("")
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState("")
  const [submittingPwd, setSubmittingPwd] = useState(false)

  // Handle Photo File Browsing & Base64 preview
  const handleImageBrowse = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setProfileMsg({ type: "error", text: "Please select a valid image file (PNG, JPG, JPEG, WebP)." })
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Image size is too large. Please select an image under 3MB." })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result)
      setProfileMsg({ type: "success", text: "Photo selected! Click 'Save Admin Profile' to save." })
    }
    reader.onerror = () => {
      setProfileMsg({ type: "error", text: "Failed to read selected image file." })
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhotoUrl("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    setProfileMsg({ type: "success", text: "Photo removed. Click 'Save Admin Profile' to save." })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg({ type: "", text: "" })

    try {
      const res = await apiRequest("/admin/profile", {
        method: "PUT",
        body: {
          name: profileName,
          photoUrl: photoUrl,
        },
      })

      if (res.user) {
        updateUser(res.user)
      }
      setProfileMsg({ type: "success", text: res.message || "Admin profile updated successfully!" })
    } catch (err) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update admin profile." })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwdError("")
    setPwdSuccessMsg("")

    if (!form.currentPassword) {
      setPwdError("Please enter your current password")
      return
    }
    if (!form.newPassword) {
      setPwdError("Please enter a new password")
      return
    }
    if (form.newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters long")
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setPwdError("New password and confirmation do not match")
      return
    }

    setSubmittingPwd(true)
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      })
      setPwdSuccessMsg("Password changed successfully!")
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setPwdError(err.message)
    } finally {
      setSubmittingPwd(false)
    }
  }

  const initials = (profileName || user?.name || "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="max-w-3xl space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageBrowse}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Settings & Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage administrator profile picture, name, and security credentials.
        </p>
      </div>

      {/* Admin Profile & Photo Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Administrator Profile & Photo
        </h2>

        {profileMsg.text && (
          <div
            className={`p-3.5 rounded-xl text-sm font-medium border ${
              profileMsg.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Avatar & Photo Upload Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md overflow-hidden border-2 border-indigo-500/20">
                {photoUrl ? (
                  <img src={photoUrl} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Click to browse & upload admin photo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Upload Photo
              </button>
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">Admin Profile Picture</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a photo from your computer to identify your admin profile across the ERP portal.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Browse Computer Photo
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Admin Full Name *
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || "admin@student.edu"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-bold text-sm disabled:opacity-60 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
            >
              {profileLoading && <Spinner size="sm" />}
              {profileLoading ? "Saving Profile..." : "Save Admin Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Change Admin Password
        </h2>

        {pwdError && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm font-medium">{pwdError}</div>}
        {pwdSuccessMsg && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium">{pwdSuccessMsg}</div>}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Current Password *</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">New Password *</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="At least 8 characters"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Confirm New Password *</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submittingPwd}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-bold text-sm disabled:opacity-60 cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
          >
            {submittingPwd && <Spinner size="sm" />}
            {submittingPwd ? "Updating Password..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings
