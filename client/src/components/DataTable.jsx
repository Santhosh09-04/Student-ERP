import React, { useState, useMemo } from "react"

const getByPath = (obj, path) => path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj)

/**
 * Generic data table with search, sort and pagination.
 */
export const DataTable = ({ data = [], columns = [], searchKeys = "", pageSize = 10, onRowClick }) => {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState("")
  const [sortDir, setSortDir] = useState("asc")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search.trim()) {
      const keys = searchKeys.split(",").filter(Boolean)
      const q = search.trim().toLowerCase()
      rows = rows.filter((row) =>
        keys.some((k) => String(getByPath(row, k) ?? "").toLowerCase().includes(q))
      )
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String(getByPath(a, sortKey) ?? "")
        const bv = String(getByPath(b, sortKey) ?? "")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return rows
  }, [data, search, sortKey, sortDir, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm font-medium">No records to display.</div>
    )
  }

  return (
    <div className="overflow-hidden">
      {searchKeys && (
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search records..."
            className="w-full sm:w-72 px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3.5 text-left font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide text-xs ${
                    col.sortable !== false ? "cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400" : ""
                  }`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1 font-bold">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pageRows.map((row, idx) => (
              <tr
                key={row._id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={
                  onRowClick
                    ? "cursor-pointer hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors"
                    : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                }
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">{safePage} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable