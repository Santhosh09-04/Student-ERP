import React, { useMemo } from "react"

/**
 * Lightweight SVG chart with dark mode text and grid support.
 */
export const Chart = ({ type = "bar", labels = [], series = [], color = "#6366f1" }) => {
  const width = 600
  const height = 200
  const pad = { top: 16, right: 16, bottom: 32, left: 40 }

  const values = useMemo(() => series.map(Number), [series])

  const maxVal = Math.max(100, ...values)
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const n = Math.max(values.length, 1)
  const step = innerW / n
  const barW = Math.min(48, step * 0.6)

  const yTicks = [0, 25, 50, 75, 100]

  const points = values.map((v, i) => {
    const x = pad.left + step * i + step / 2
    const y = pad.top + innerH - (v / maxVal) * innerH
    return { x, y, value: v }
  })

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] h-auto" role="img" aria-label="Chart">
        {/* Y-axis gridlines + labels */}
        {yTicks.map((t) => {
          const y = pad.top + innerH - (t / 100) * innerH
          return (
            <g key={t}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={pad.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fontWeight="600"
                className="fill-slate-500 dark:fill-slate-400"
              >
                {t}
              </text>
            </g>
          )
        })}

        {type === "bar" &&
          points.map((p, i) => (
            <rect
              key={i}
              x={p.x - barW / 2}
              y={p.y}
              width={barW}
              height={pad.top + innerH - p.y}
              rx={6}
              fill={color}
              opacity={0.9}
            >
              <title>{`${labels[i] || ""}: ${p.value}%`}</title>
            </rect>
          ))}

        {type === "line" && (
          <>
            <polyline
              points={polyline}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={5}
                fill={color}
                className="stroke-white dark:stroke-slate-900"
                strokeWidth={2}
              >
                <title>{`${labels[i] || ""}: ${p.value}%`}</title>
              </circle>
            ))}
          </>
        )}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          const x = pad.left + step * i + step / 2
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize={11}
              fontWeight="600"
              className="fill-slate-600 dark:fill-slate-300"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export default Chart