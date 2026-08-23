import type { Calendar, Day } from "@/lib/contributions";

/** Greyscale ramp: unlit cell, then brighter the more shipped that day. */
const LEVELS = [
  "rgb(var(--fg) / 0.07)",
  "#404040",
  "#707070",
  "#a8a8a8",
  "#f2f2f2",
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const firstDay = (week: (Day | null)[]) => week.find((d) => d !== null) ?? null;

export default function ContributionGrid({ calendar }: { calendar: Calendar }) {
  /** A label every time the month turns, unless the last one is too close to fit. */
  let lastLabelled = -4;
  const labels = calendar.weeks.map((week, i) => {
    const day = firstDay(week);
    if (!day) return null;
    const month = Number(day.date.slice(5, 7)) - 1;
    const prev = i > 0 ? firstDay(calendar.weeks[i - 1]) : null;
    const prevMonth = prev ? Number(prev.date.slice(5, 7)) - 1 : -1;
    if (month === prevMonth || i - lastLabelled < 3) return null;
    lastLabelled = i;
    return MONTHS[month];
  });

  return (
    <div className="overflow-x-auto rounded-lg bg-panel p-4 md:p-6">
      <div className="inline-block min-w-full">
        <div className="mb-2 flex gap-[3px] font-mono text-[9px] tracking-label text-dim">
          {labels.map((label, i) => (
            <span key={i} className="w-[11px] shrink-0 whitespace-nowrap">
              {label}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {calendar.weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((day, j) => (
                <div
                  key={j}
                  title={day ? `${day.count} on ${day.date}` : undefined}
                  className="h-[11px] w-[11px] shrink-0"
                  style={{ background: day ? LEVELS[day.level] : "transparent" }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-[3px] font-mono text-[9px] tracking-label text-dim">
          <span className="mr-1">LESS</span>
          {LEVELS.map((level) => (
            <span
              key={level}
              className="h-[11px] w-[11px]"
              style={{ background: level }}
            />
          ))}
          <span className="ml-1">MORE</span>
        </div>
      </div>
    </div>
  );
}
