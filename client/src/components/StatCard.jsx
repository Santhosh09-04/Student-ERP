import React from "react"

export const StatCard = ({ title, value, trend, trendValue }) => {
  const trendClass =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
      ? "text-rose-600 dark:text-rose-400"
      : "text-indigo-600 dark:text-indigo-400"

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p>
        </div>
        {trendValue && <div className={`text-xs font-bold ${trendClass}`}>{trendValue}</div>}
      </div>
    </div>
  )
}

export default StatCard