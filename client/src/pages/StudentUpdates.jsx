import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { apiRequest } from "../utils/api"
import { Badge, EmptyState, PageSkeleton } from "../components"

const READ_STORAGE_KEY = "erp_read_announcements"

const getReadIds = () => {
  try {
    return JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

export const StudentUpdates = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [announcements, setAnnouncements] = useState([])
  const [category, setCategory] = useState("")
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(searchParams.get("filter") === "unread")
  const [readIds, setReadIds] = useState(getReadIds())
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    apiRequest(`/announcements${category ? `?category=${category}` : ""}`)
      .then((data) => { if (!cancelled) setAnnouncements(data || []) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [category])

  // Sync with searchParams if filter changes in URL
  useEffect(() => {
    if (searchParams.get("filter") === "unread") {
      setFilterUnreadOnly(true)
    }
  }, [searchParams])

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id]
      setReadIds(updated)
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated))
    }
  }

  const handleOpenAnnouncement = (item) => {
    markAsRead(item._id)
    setSelectedAnnouncement(item)
  }

  const markAllAsRead = () => {
    const allIds = announcements.map((a) => a._id)
    setReadIds(allIds)
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(allIds))
  }

  const cats = ["", "Important", "Notice", "Homework", "Circular", "Event", "Exam"]

  const filteredAnnouncements = announcements.filter((item) => {
    if (filterUnreadOnly && readIds.includes(item._id)) return false
    return true
  })

  const unreadCount = announcements.filter((item) => !readIds.includes(item._id)).length

  if (loading) return <PageSkeleton />
  if (error) return <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4">{error}</div>

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Daily Updates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread announcement${unreadCount > 1 ? "s" : ""}. Click any card to read.`
              : "You're all caught up with all announcements!"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold px-3.5 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors cursor-pointer"
            >
              ✓ Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* All vs Unread toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setFilterUnreadOnly(false)
              setSearchParams({})
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !filterUnreadOnly
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Updates ({announcements.length})
          </button>
          <button
            onClick={() => {
              setFilterUnreadOnly(true)
              setSearchParams({ filter: "unread" })
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterUnreadOnly
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 flex-wrap">
          {cats.map((c) => (
            <button
              key={c || "all"}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                category === c
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500"
              }`}
            >
              {c || "All Categories"}
            </button>
          ))}
        </div>
      </div>

      {/* List of Announcements */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title={filterUnreadOnly ? "No unread updates" : "No updates posted yet"}
          description={
            filterUnreadOnly
              ? "You have read all updates! Switch to 'All Updates' to view past announcements."
              : "Check back later — the administration will post announcements, homework and circulars here."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => {
            const isUnread = !readIds.includes(a._id)
            return (
              <article
                key={a._id}
                onClick={() => handleOpenAnnouncement(a)}
                className={`group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 cursor-pointer border-l-4 border ${
                  isUnread
                    ? "border-l-indigo-600 border-slate-200 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/20"
                    : "border-l-slate-300 dark:border-l-slate-700 border-slate-100 dark:border-slate-800"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-wide uppercase">
                        UNREAD
                      </span>
                    )}
                    <Badge value={a.category} />
                    <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                      {new Date(a.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {a.postedBy?.name && <span className="text-xs text-slate-400 dark:text-slate-400">· by {a.postedBy.name}</span>}
                  </div>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                    Click to read →
                  </span>
                </div>
                <h3 className={`font-bold text-base mb-1 ${isUnread ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-800 dark:text-slate-200"}`}>
                  {a.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">{a.description}</p>
              </article>
            )
          })}
        </div>
      )}

      {/* Reader Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge value={selectedAnnouncement.category} />
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(selectedAnnouncement.date).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedAnnouncement.title}</h2>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-2">
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.description}
              </p>
            </div>

            {selectedAnnouncement.postedBy?.name && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Posted by: {selectedAnnouncement.postedBy.name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  ✓ Marked as Read
                </span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentUpdates