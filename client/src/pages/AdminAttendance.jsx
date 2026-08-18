import React, { useState, useEffect, useCallback } from "react"
import { apiRequest } from "../utils/api"
import { Badge, EmptyState, PageSkeleton, Spinner } from "../components"

export const AdminAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState("")

  const load = useCallback(async (d) => {
    try {
      const data = await apiRequest(`/admin/attendance?date=${d}`)
      setRecords(data || [])
      setError("")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(date) }, [date, load])

  const mark = async (row, status) => {
    setSavingId(row.studentId)
    try {
      await apiRequest("/admin/attendance", {
        method: "POST",
        body: { studentId: row.studentId, date, status },
      })
      setRecords((rows) => rows.map((r) => (r.studentId === row.studentId ? { ...r, status } : r)))
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  const setAll = async (status) => {
    try {
      await Promise.all(
        records.map((r) =>
          apiRequest("/admin/attendance", {
            method: "POST",
            body: { studentId: r.studentId, date, status },
          })
        )
      )
      setRecords((rows) => rows.map((r) => ({ ...r, status })))
    } catch (err) {
      setError(err.message)
    }
  }

  const exportCsv = () => {
    window.location.href = `/api/admin/attendance/export?date=${date}`
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
          <p className="text-slate-500 text-sm mt-1">Mark daily attendance per student</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={exportCsv} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2">
        <button onClick={() => setAll("present")} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
          Mark all present
        </button>
        <button onClick={() => setAll("absent")} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
          Mark all absent
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {records.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Enroll students first to manage attendance."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Enrollment ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.studentId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-800 dark:text-slate-200">{r.enrollmentId}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                          {r.photoUrl ? (
                            <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(r.name || "S").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}</span>
                          )}
                        </div>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.class} {r.section ? `(${r.section})` : ""}</td>
                    <td className="px-4 py-3">
                      <Badge value={r.status || "not-marked"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          disabled={savingId === r.studentId}
                          onClick={() => mark(r, "present")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            r.status === "present"
                              ? "bg-green-600 text-white"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          disabled={savingId === r.studentId}
                          onClick={() => mark(r, "absent")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            r.status === "absent"
                              ? "bg-red-600 text-white"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          disabled={savingId === r.studentId}
                          onClick={() => mark(r, "late")}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            r.status === "late"
                              ? "bg-amber-500 text-white"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAttendance