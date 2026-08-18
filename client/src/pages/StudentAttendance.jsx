import React, { useState, useEffect } from "react"
import { apiRequest } from "../utils/api"
import { Badge, EmptyState, PageSkeleton } from "../components"

export const StudentAttendance = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    apiRequest("/attendance")
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <PageSkeleton />
  if (error) return <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4">{error}</div>

  const records = data?.records || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Record</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your monthly and daily school attendance logs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 text-center">
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{data?.percentage ?? 0}%</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Overall Percentage</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 text-center">
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{data?.presentDays ?? 0}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Present Days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 text-center">
          <p className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{data?.totalDays ?? 0}</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Total School Days</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-4">Daily Attendance History</h2>
        {records.length === 0 ? (
          <EmptyState title="No attendance records yet" description="Attendance entries will appear here once your teacher marks them." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((r) => (
              <div key={r._id} className="flex items-center justify-between py-3.5">
                <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                  {new Date(r.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </span>
                <Badge value={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentAttendance