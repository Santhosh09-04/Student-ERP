import React, { useState, useEffect, useCallback, useRef } from "react"
import { apiRequest } from "../utils/api"
import { DataTable, EmptyState, PageSkeleton } from "../components"

export const AdminStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [viewingStudent, setViewingStudent] = useState(null)
  const fileInputRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await apiRequest("/admin/students?limit=100")
      setStudents(data.students || [])
      setError("")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (row) => {
    setEditing(row._id)
    setForm({
      name: row.user?.name || "",
      rollNo: row.rollNo || "",
      class: row.class || "",
      section: row.section || "",
      contact: row.contact || "",
      address: row.address || "",
      photoUrl: row.photoUrl || row.user?.photoUrl || "",
    })
  }

  const cancelEdit = () => { setEditing(null); setForm({}) }

  const handlePhotoBrowse = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WebP).")
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size is too large. Please select an image under 3MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, photoUrl: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const saveEdit = async (row) => {
    try {
      await apiRequest(`/admin/students/${row._id}`, { method: "PUT", body: form })
      setEditing(null)
      setForm({})
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete student ${row.user?.name || row.enrollmentId}? This cannot be undone.`)) return
    try {
      await apiRequest(`/admin/students/${row._id}`, { method: "DELETE" })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <PageSkeleton />

  const columns = [
    {
      key: "photo",
      label: "Photo",
      sortable: false,
      render: (row) => {
        const photo = row.photoUrl || row.user?.photoUrl
        const initials = (row.user?.name || "S")
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
        return (
          <button
            type="button"
            onClick={() => setViewingStudent(row)}
            className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
            title="Click to view student profile photo"
          >
            {photo ? (
              <img src={photo} alt={row.user?.name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </button>
        )
      },
    },
    { key: "enrollmentId", label: "Enrollment ID" },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewingStudent(row)}
          className="font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-left cursor-pointer"
        >
          {row.user?.name || "—"}
        </button>
      ),
    },
    { key: "class", label: "Class" },
    { key: "section", label: "Section" },
    { key: "contact", label: "Contact" },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          {editing === row._id ? (
            <>
              <button onClick={() => saveEdit(row)} className="text-xs font-semibold text-green-600 hover:text-green-800 cursor-pointer">Save</button>
              <button onClick={cancelEdit} className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setViewingStudent(row)} className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer">View</button>
              <button onClick={() => startEdit(row)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">Edit</button>
              <button onClick={() => remove(row)} className="text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer">Delete</button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Editing Photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoBrowse}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Students</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{students.length} students enrolled</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm font-medium">{error}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        {students.length === 0 ? (
          <EmptyState title="No students enrolled yet" description="Use the Student Enrollment page to add your first student." />
        ) : (
          <>
            {editing && (
              <div className="mb-6 p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-4">Editing Student: {form.name}</h3>
                
                {/* Photo Row in Edit */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-indigo-200/60 dark:border-indigo-800/60">
                  <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center overflow-hidden border border-indigo-300">
                    {form.photoUrl ? (
                      <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>📷</span>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      {form.photoUrl ? "Change Photo" : "Upload Photo"}
                    </button>
                    {form.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
                        className="ml-2 px-2 py-1 text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
                  <input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="Roll no" className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
                  <input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="Class" className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
                  <input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="Section" className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
                  <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Contact" className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
                </div>
              </div>
            )}

            <DataTable
              data={students}
              columns={columns}
              searchKeys="enrollmentId,user.name,class,section,contact"
              pageSize={10}
            />
          </>
        )}
      </div>

      {/* Student Detail Photo View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewingStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-32 h-32 rounded-2xl bg-indigo-600 text-white font-bold text-4xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-indigo-500/20">
                {viewingStudent.photoUrl || viewingStudent.user?.photoUrl ? (
                  <img
                    src={viewingStudent.photoUrl || viewingStudent.user?.photoUrl}
                    alt={viewingStudent.user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(viewingStudent.user?.name || "S")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{viewingStudent.user?.name || "Student"}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  {viewingStudent.class} {viewingStudent.section ? `· Section ${viewingStudent.section}` : ""}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-0.5">
                  ID: {viewingStudent.enrollmentId}
                </p>
              </div>

              <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-left space-y-2 text-sm border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-xs uppercase font-semibold block">Email</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{viewingStudent.user?.email || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase font-semibold block">Contact Number</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{viewingStudent.contact || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase font-semibold block">Address</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{viewingStudent.address || "Not provided"}</span>
                </div>
              </div>

              <button
                onClick={() => setViewingStudent(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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

export default AdminStudents