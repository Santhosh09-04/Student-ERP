import React, { useState, useEffect } from "react"
import { apiRequest } from "../utils/api"
import { Card, PageSkeleton } from "../components"

const getGradeBadge = (grade, percentage) => {
  if (percentage >= 90 || grade === "A+") {
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">A+ · Outstanding</span>
  }
  if (percentage >= 80 || grade === "A") {
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800">A · Excellent</span>
  }
  if (percentage >= 70 || grade === "B") {
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800">B · Very Good</span>
  }
  if (percentage >= 60 || grade === "C") {
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800">C · Good</span>
  }
  if (percentage >= 50 || grade === "D") {
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800">D · Pass</span>
  }
  return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800">F · Needs Improvement</span>
}

export const StudentMarks = () => {
  const [data, setData] = useState(null)
  const [selectedTerm, setSelectedTerm] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    apiRequest("/marks")
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) return <PageSkeleton />
  if (error) return <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4">{error}</div>

  const marks = data?.marks || []
  const terms = ["All", ...new Set(marks.map((m) => m.term))]
  const filtered = selectedTerm === "All" ? marks : marks.filter((m) => m.term === selectedTerm)

  const aggregate = (rows) => {
    if (!rows.length) return { pct: 0, grade: "—", obtained: 0, max: 0 }
    const obtained = rows.reduce((s, m) => s + m.marksObtained, 0)
    const max = rows.reduce((s, m) => s + m.maxMarks, 0)
    const pct = Math.round((obtained / max) * 100)
    let grade = "F"
    if (pct >= 90) grade = "A+"
    else if (pct >= 80) grade = "A"
    else if (pct >= 70) grade = "B"
    else if (pct >= 60) grade = "C"
    else if (pct >= 50) grade = "D"
    return { pct, grade, obtained, max }
  }

  const agg = aggregate(filtered)
  const overall = aggregate(marks)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marks & Results</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View your subject marks, grades, and academic performance.</p>
        </div>

        {/* Term Filters */}
        <div className="flex gap-2 flex-wrap">
          {terms.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTerm === t
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Term Average" value={`${agg.pct}%`} trendValue={`Grade ${agg.grade}`} trend={agg.pct >= 75 ? "up" : undefined} />
        <Card title="Total Score" value={`${agg.obtained} / ${agg.max}`} trendValue={`${filtered.length} Subjects`} />
        <Card title="Cumulative Grade" value={overall.grade} trendValue={`${overall.pct}% Average`} trend={overall.pct >= 75 ? "up" : undefined} />
      </div>

      {/* Subject Marks List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-white text-lg">Subject Performance Breakdown</h2>
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} Subjects Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left font-bold">Subject</th>
                <th className="px-6 py-3.5 text-left font-bold">Exam Type</th>
                <th className="px-6 py-3.5 text-left font-bold">Term</th>
                <th className="px-6 py-3.5 text-center font-bold">Marks Obtained</th>
                <th className="px-6 py-3.5 text-left font-bold">Score Bar</th>
                <th className="px-6 py-3.5 text-right font-bold">Grade & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((m) => {
                const pct = m.percentage ?? Math.round((m.marksObtained / m.maxMarks) * 100)
                return (
                  <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                        {m.subject.charAt(0)}
                      </div>
                      <span>{m.subject}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{m.examType || "Term Exam"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium">{m.term}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800 dark:text-white text-base">{m.marksObtained}</span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs"> / {m.maxMarks}</span>
                    </td>
                    <td className="px-6 py-4 w-44">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 90
                                ? "bg-emerald-500"
                                : pct >= 80
                                ? "bg-indigo-500"
                                : pct >= 70
                                ? "bg-blue-500"
                                : pct >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {getGradeBadge(m.grade, pct)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentMarks