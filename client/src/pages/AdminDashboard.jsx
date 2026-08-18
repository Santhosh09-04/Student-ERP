import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { StatCard, PageSkeleton, Badge, EmptyState } from "../components"
import { apiRequest } from "../utils/api"

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendanceToday: 0,
    avgPerformance: 0,
    recentUpdates: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    apiRequest("/admin/dashboard/stats")
      .then((data) => {
        if (!cancelled) {
          setStats(data)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <PageSkeleton />
  if (error) return <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-medium">{error}</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of school metrics, attendance, and updates</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents ?? 0}
          trend="up"
          trendValue="Active Enrolled"
        />
        <StatCard
          title="Attendance Today"
          value={stats.attendanceToday ?? 0}
          trend="up"
          trendValue="Present Students"
        />
        <StatCard
          title="Avg Attendance Rate"
          value={`${stats.avgPerformance ?? 0}%`}
          trend="up"
          trendValue="Overall Rate"
        />
        <StatCard
          title="Announcements"
          value={stats.recentUpdates?.length ?? 0}
          trend="neutral"
          trendValue="Total Posts"
        />
      </div>

      {/* Quick Action Cards & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Management Links */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/enrollment"
              className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors flex flex-col items-center text-center group cursor-pointer"
            >
              <svg className="w-6 h-6 mb-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="font-bold text-sm">Enroll Student</span>
              <span className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">Add new student profile</span>
            </Link>

            <Link
              to="/admin/attendance"
              className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-colors flex flex-col items-center text-center group cursor-pointer"
            >
              <svg className="w-6 h-6 mb-2 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-sm">Mark Attendance</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Record daily attendance</span>
            </Link>

            <Link
              to="/admin/marks"
              className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 transition-colors flex flex-col items-center text-center group cursor-pointer"
            >
              <svg className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-bold text-sm">Enter Marks</span>
              <span className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">Record exam grades</span>
            </Link>

            <Link
              to="/admin/updates"
              className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 transition-colors flex flex-col items-center text-center group cursor-pointer"
            >
              <svg className="w-6 h-6 mb-2 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="font-bold text-sm">Post Announcement</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Notify students</span>
            </Link>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Announcements</h2>
            <Link to="/admin/updates" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
              View All →
            </Link>
          </div>

          {stats.recentUpdates?.length === 0 ? (
            <EmptyState title="No recent announcements" description="Post news and updates from the Daily Updates tab." />
          ) : (
            <div className="space-y-3">
              {stats.recentUpdates.map((item) => (
                <div key={item.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge value={item.category} />
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                        {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</h3>
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

export default AdminDashboard