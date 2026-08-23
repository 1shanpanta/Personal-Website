/** Revalidation is request-driven, not a timer: nothing refetches until someone visits. */
const FIVE_DAYS = 5 * 24 * 60 * 60;

export type Day = { date: string; level: number; count: number };

export type Calendar = {
  total: string;
  /** 53 columns of 7 days, Sunday first. Empty leading and trailing slots are null. */
  weeks: (Day | null)[][];
};

const CELL = /<td\b[^>]*?\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*?\bid="contribution-day-component-(\d)-(\d+)"[^>]*?\bdata-level="(\d)"/g;
const TOOLTIP = /<tool-tip\b[^>]*\bfor="contribution-day-component-(\d)-(\d+)"[^>]*>([^<]*)</g;
const TOTAL = /([\d,]+)\s*\n?\s*contributions/;

/**
 * Reads the public contribution calendar. No token, no third-party proxy.
 * Returns null on any failure so the caller can drop the section rather than
 * render an empty grid that reads as "no work".
 */
export async function getContributions(user: string): Promise<Calendar | null> {
  let html: string;
  try {
    const res = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { accept: "text/html" },
      next: { revalidate: FIVE_DAYS },
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const counts = new Map<string, number>();
  for (const m of html.matchAll(TOOLTIP)) {
    const n = /^(\d+)/.exec(m[3].trim());
    counts.set(`${m[1]}-${m[2]}`, n ? Number(n[1]) : 0);
  }

  const cells: { day: number; week: number; value: Day }[] = [];
  for (const m of html.matchAll(CELL)) {
    const day = Number(m[2]);
    const week = Number(m[3]);
    cells.push({
      day,
      week,
      value: {
        date: m[1],
        level: Number(m[4]),
        count: counts.get(`${day}-${week}`) ?? 0,
      },
    });
  }
  if (cells.length === 0) return null;

  const columns = Math.max(...cells.map((c) => c.week)) + 1;
  const weeks: (Day | null)[][] = Array.from({ length: columns }, () =>
    Array<Day | null>(7).fill(null),
  );
  for (const c of cells) weeks[c.week][c.day] = c.value;

  const total = TOTAL.exec(html);
  return { total: total ? total[1] : "", weeks };
}
