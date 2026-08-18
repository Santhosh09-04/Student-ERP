import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { apiRequest } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import { Card, Badge, EmptyState, PageSkeleton } from "../components"

const READ_STORAGE_KEY = "erp_read_announcements"

export const StudentDashboard = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState(null)
  const [marksData, setMarksData] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      apiRequest("/attendance"),
      apiRequest("/marks"),
      apiRequest("/announcements"),
    ])
      .then(([att, marks, ann]) => {
        if (cancelled) return
        if (att.status === "fulfilled") setAttendance(att.value)
        if (marks.status === "fulfilled") setMarksData(marks.value)
        if (ann.status === "fulfilled") setAnnouncements(ann.value || [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <PageSkeleton />
  if (error) return <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4">{error}</div>

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  // Calculate unread announcements
  let readIds = []
  try {
    readIds = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "[]")
  } catch {
    readIds = []
  }
  const unreadCount = announcements.filter((a) => !readIds.includes(a._id)).length

  // Latest term summary
  const latestTerm = marksData?.termSummary?.slice(-1)[0]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-indigo-200 text-sm font-medium">{today}</p>
        <h1 className="text-2xl font-bold mt-1">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
        </h1>
        <p className="text-indigo-100 text-sm mt-2 font-medium">
          {user?.class ? `${user.class}${user.section ? ` · Section ${user.section}` : ""}` : "Track your academic journey below."}
          {user?.enrollmentId ? ` · ${user.enrollmentId}` : ""}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/student/attendance" className="block transition-transform hover:-translate-y-0.5">
          <Card title="Attendance" value={attendance ? `${attendance.percentage}%` : "—"} trendValue="This month" />
        </Link>
        <Link to="/student/marks" className="block transition-transform hover:-translate-y-0.5">
          <Card title="Marks Entered" value={marksData?.marks?.length ?? "—"} trendValue="Records" />
        </Link>
        <Link to="/student/performance" className="block transition-transform hover:-translate-y-0.5">
          <Card title="Latest Term Score" value={latestTerm ? `${latestTerm.percentage}%` : "—"} trendValue={latestTerm?.term || "—"} />
        </Link>
        <Link to="/student/updates?filter=unread" className="block transition-transform hover:-translate-y-0.5">
          <Card
            title="New Updates"
            value={unreadCount}
            trendValue="Unread →"
            trend={unreadCount > 0 ? "up" : undefined}
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest announcement */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white">Latest Update</h2>
            <Link to="/student/updates" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              View all →
            </Link>
          </div>
          {announcements.length === 0 ? (
            <EmptyState title="No updates yet" description="Check back later for announcements from your school." />
          ) : (
            <Link to="/student/updates" className="block group">
              <article className="border-l-4 border-indigo-500 pl-4 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-950/40 p-3 rounded-r-xl transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge value={announcements[0].category} />
                  <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                    {new Date(announcements[0].date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {announcements[0].title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 line-clamp-3">{announcements[0].description}</p>
              </article>
            </Link>
          )}
        </div>

        {/* Marks summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white">Marks Summary</h2>
            <Link to="/student/marks" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Details →
            </Link>
          </div>
          {!marksData || marksData.marks.length === 0 ? (
            <EmptyState title="No marks recorded" description="Your performance will appear here once results are published." />
          ) : (
            <div className="space-y-4">
              {marksData.termSummary.map((t) => (
                <div key={t.term}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{t.term}</span>
                    <span className="font-bold text-slate-800 dark:text-white">{t.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        t.percentage >= 75 ? "bg-emerald-500" : t.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard