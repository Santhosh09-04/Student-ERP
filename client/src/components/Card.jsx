import React from "react"

export const Card = ({ title, value, trend, trendValue, children }) => {
  const trendClass =
    trend === "up" ? "text-emerald-600 dark:text-emerald-400" : trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-indigo-600 dark:text-indigo-400"

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
      <div className="flex justify-between items-start">
        <div>
          {title && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>}
          {value !== undefined && <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>}
        </div>
        {trendValue && <span className={`text-sm font-medium ${trendClass}`}>{trendValue}</span>}
      </div>
      {children}
    </div>
  )
}

export default Card