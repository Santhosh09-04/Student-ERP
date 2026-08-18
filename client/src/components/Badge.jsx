import React from "react"

const styles = {
  present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800",
  absent: "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800",
  late: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800",
  important: "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800",
  notice: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 dark:border dark:border-blue-800",
  homework: "bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 dark:border dark:border-violet-800",
  circular: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border dark:border-cyan-800",
  event: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800",
  exam: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800",
  admin: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border dark:border-indigo-800",
  student: "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 dark:border dark:border-sky-800",
}

export const Badge = ({ value }) => {
  const key = String(value || "").toLowerCase().replace(/\s+/g, "")
  const cls = styles[key] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {value}
    </span>
  )
}

export default Badge