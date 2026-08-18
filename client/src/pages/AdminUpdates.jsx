import React, { useState, useEffect, useCallback } from "react"
import { apiRequest } from "../utils/api"
import { Badge, EmptyState, PageSkeleton, Spinner } from "../components"

const categories = ["General", "Exam", "Holiday", "Homework", "Circular", "Event"]

export const AdminUpdates = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
  })

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiRequest("/admin/announcements")
      setAnnouncements(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!form.title.trim()) {
      setError("Announcement title is required")
      return
    }
    if (!form.description.trim()) {
      setError("Announcement description is required")
      return
    }

    setSubmitting(true)
    try {
      await apiRequest("/admin/announcements", {
        method: "POST",
        body: form,
      })
      setSuccessMsg("Announcement posted successfully!")
      setForm({ title: "", description: "", category: "General" })
      loadAnnouncements()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return
    try {
      await apiRequest(`/admin/announcements/${id}`, { method: "DELETE" })
      loadAnnouncements()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daily Updates & Announcements</h1>
        <p className="text-slate-500 text-sm mt-1">Post notices, homework, circulars, and events for students</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      {successMsg && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{successMsg}</div>}

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Create New Announcement</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Midterm Examination Schedule Released"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description / Details *</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Write full announcement details here..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-60"
          >
            {submitting && <Spinner size="sm" />}
            Post Announcement
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Posted Announcements</h2>

        {announcements.length === 0 ? (
          <EmptyState title="No announcements posted yet" description="Post your first announcement using the form above." />
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div key={item._id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge value={item.category} />
                      <span className="text-xs text-slate-400">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base">{item.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-slate-600 text-sm mt-3 whitespace-pre-wrap">{item.description}</p>
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-400">
                  Posted by: {item.postedBy?.name || "Administrator"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUpdates
