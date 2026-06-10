import { scoreColor } from "@/lib/ui";

// SVG circular gauge for copilot scores (completeness / approval likelihood).
export function ScoreRing({
  value,
  label,
  size = 84,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const stroke = value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={6} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <span className={`absolute inset-0 grid place-items-center text-xl font-bold ${scoreColor(value)}`}>
          {value}
          <span className="text-xs font-medium">%</span>
        </span>
      </div>
      <span className="text-center text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}
