// Lightweight SVG donut chart — no chart library needed.
export default function DonutChart({ data, size = 200, thickness = 26 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * c
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dashoffset .6s ease' }}
            />
          )
          offset += len
          return seg
        })}
        <text
          x="50%" y="50%"
          className="fill-white"
          fontSize="26" fontWeight="800"
          textAnchor="middle" dominantBaseline="central"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {total}
        </text>
      </svg>

      <ul className="w-full space-y-2">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 text-white/80">{d.label}</span>
            <span className="font-semibold text-white/50">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
