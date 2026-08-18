import React, { useState, useEffect } from "react"
import { apiRequest } from "../utils/api"
import { Card, Chart, EmptyState, PageSkeleton } from "../components"
import { useAuth } from "../context/AuthContext"

export const StudentPerformance = () => {
  const { user } = useAuth()
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    apiRequest("/marks")
      .then((data) => { if (!cancelled) setMarks(data.marks || []) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <PageSkeleton />
  if (error) return <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4">{error}</div>

  if (marks.length === 0) {
    return <EmptyState title="No performance data available" description="Marks have not been recorded yet. Check back after your exams." />
  }

  // Term-wise aggregate performance
  const byTerm = marks.reduce((acc, m) => {
    if (!acc[m.term]) acc[m.term] = { obtained: 0, max: 0 }
    acc[m.term].obtained += m.marksObtained
    acc[m.term].max += m.maxMarks
    return acc
  }, {})

  const terms = Object.keys(byTerm)
  const scores = terms.map((t) => Math.round((byTerm[t].obtained / byTerm[t].max) * 100))

  // Subject-wise average
  const bySubject = marks.reduce((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = { obtained: 0, max: 0 }
    acc[m.subject].obtained += m.marksObtained
    acc[m.subject].max += m.maxMarks
    return acc
  }, {})
  const subjectData = Object.entries(bySubject).map(([subject, v]) => ({
    subject,
    avg: Math.round((v.obtained / v.max) * 100),
  }))

  const strongest = [...subjectData].sort((a, b) => b.avg - a.avg)[0]
  const weakest = [...subjectData].sort((a, b) => a.avg - b.avg)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Performance Analytics</h1>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {user?.name || "Student"} · {user?.enrollmentId || ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Performance Trend Across Terms">
          <div className="mt-4">
            <Chart type="Line" labels={terms} series={scores} />
          </div>
        </Card>

        <Card title="Subject-wise Performance (%)">
          <div className="mt-4 space-y-3.5">
            {subjectData.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{s.subject}</span>
                  <span className="font-bold text-slate-800 dark:text-white">{s.avg}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.avg >= 75 ? "bg-emerald-500" : s.avg >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${s.avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">💪 Strongest Subject</p>
          <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">{strongest.subject}</p>
          <p className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold mt-0.5">Average {strongest.avg}%</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">📚 Needs Improvement</p>
          <p className="text-2xl font-extrabold text-rose-900 dark:text-rose-200 mt-1">{weakest.subject}</p>
          <p className="text-rose-700 dark:text-rose-400 text-sm font-semibold mt-0.5">Average {weakest.avg}%</p>
        </div>
      </div>
    </div>
  )
}

export default StudentPerformance