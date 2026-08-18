import React, { useState, useEffect, useCallback } from "react"
import { apiRequest } from "../utils/api"
import { DataTable, EmptyState, PageSkeleton, Spinner, Badge } from "../components"

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "History",
  "Geography",
]

const examTypes = ["Unit Test", "Midterm", "Final Exam", "Quiz", "Assignment"]
const terms = ["Term 1", "Term 2", "Term 3", "Annual"]

export const AdminMarks = () => {
  const [students, setStudents] = useState([])
  const [marksList, setMarksList] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const [form, setForm] = useState({
    studentId: "",
    subject: "Mathematics",
    examType: "Midterm",
    term: "Term 1",
    marksObtained: "",
    maxMarks: "100",
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [stuRes, marksRes] = await Promise.all([
        apiRequest("/admin/students?limit=100"),
        apiRequest("/admin/marks"),
      ])
      setStudents(stuRes.students || [])
      setMarksList(marksRes || [])
      if (stuRes.students?.length > 0 && !form.studentId) {
        setForm((f) => ({ ...f, studentId: stuRes.students[0]._id }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const calculatedPct =
    form.marksObtained !== "" && form.maxMarks > 0
      ? Math.round((Number(form.marksObtained) / Number(form.maxMarks)) * 100)
      : null

  const getGrade = (pct) => {
    if (pct === null) return "—"
    if (pct >= 90) return "A+"
    if (pct >= 80) return "A"
    if (pct >= 70) return "B"
    if (pct >= 60) return "C"
    if (pct >= 50) return "D"
    return "F"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!form.studentId) {
      setError("Please select a student")
      return
    }
    if (form.marksObtained === "" || Number(form.marksObtained) < 0) {
      setError("Please enter valid marks obtained")
      return
    }
    if (!form.maxMarks || Number(form.maxMarks) <= 0) {
      setError("Please enter valid maximum marks")
      return
    }
    if (Number(form.marksObtained) > Number(form.maxMarks)) {
      setError("Marks obtained cannot exceed maximum marks")
      return
    }

    setSubmitting(true)
    try {
      await apiRequest("/admin/marks", {
        method: "POST",
        body: {
          ...form,
          marksObtained: Number(form.marksObtained),
          maxMarks: Number(form.maxMarks),
        },
      })
      setSuccessMsg("Marks recorded successfully!")
      setForm((f) => ({ ...f, marksObtained: "" }))
      loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this marks record?")) return
    try {
      await apiRequest(`/admin/marks/${id}`, { method: "DELETE" })
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <PageSkeleton />

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (row) => {
        const stu = students.find((s) => s._id === row.studentId)
        return (
          <div>
            <p className="font-medium text-slate-800">{stu?.user?.name || "Student"}</p>
            <p className="text-xs text-slate-400 font-mono">{stu?.enrollmentId || "—"}</p>
          </div>
        )
      },
    },
    { key: "subject", label: "Subject" },
    { key: "examType", label: "Exam" },
    { key: "term", label: "Term" },
    {
      key: "score",
      label: "Score",
      render: (row) => (
        <span className="font-medium text-slate-800">
          {row.marksObtained} / {row.maxMarks}
        </span>
      ),
    },
    {
      key: "percentage",
      label: "Percentage",
      render: (row) => {
        const pct = Math.round((row.marksObtained / row.maxMarks) * 100)
        return <Badge value={pct >= 75 ? "present" : pct >= 50 ? "late" : "absent"}>{pct}%</Badge>
      },
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="text-xs font-medium text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Marks & Grades Entry</h1>
        <p className="text-slate-500 text-sm mt-1">Add and manage exam marks for enrolled students</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
      {successMsg && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{successMsg}</div>}

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Record New Marks</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Student *</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {students.length === 0 ? (
                <option value="">No students available</option>
              ) : (
                students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.user?.name || "Unnamed"} ({s.enrollmentId} - Class {s.class})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Exam Type *</label>
            <select
              value={form.examType}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {examTypes.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Term *</label>
            <select
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Marks Obtained *</label>
            <input
              type="number"
              min="0"
              value={form.marksObtained}
              onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
              placeholder="e.g. 85"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Marks *</label>
            <input
              type="number"
              min="1"
              value={form.maxMarks}
              onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Calculated Grade Preview */}
        {calculatedPct !== null && (
          <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg text-sm">
            <span className="text-indigo-800 font-medium">Calculated Percentage: {calculatedPct}%</span>
            <span className="text-indigo-800 font-medium">Grade: {getGrade(calculatedPct)}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting || students.length === 0}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-60"
          >
            {submitting && <Spinner size="sm" />}
            Save Marks
          </button>
        </div>
      </form>

      {/* Marks Records Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recorded Marks History</h2>
        {marksList.length === 0 ? (
          <EmptyState title="No marks recorded yet" description="Add student exam marks using the form above." />
        ) : (
          <DataTable
            data={marksList}
            columns={columns}
            searchKeys="subject,examType,term"
            pageSize={10}
          />
        )}
      </div>
    </div>
  )
}

export default AdminMarks
