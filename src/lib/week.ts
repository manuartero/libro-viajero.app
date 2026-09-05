// YYYY-MM-DD in the teacher's own calendar. Formatted via local getters:
// toISOString() is UTC, which shifts the date before 01:00/02:00 in Spain.
export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${dayOfMonth}`;
}

// The inverse of isoDate(): local midnight of that calendar day. `new
// Date("2026-08-31")` would parse as UTC midnight, which is the previous
// evening west of Greenwich and a different calendar day.
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays({ iso, days }: { iso: string; days: number }): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

// Whole calendar days from `from` to `to`, negative when `to` is earlier.
// Rounded rather than truncated so a DST hour in between cannot lose a day.
export function daysBetween({ from, to }: { from: string; to: string }) {
  const ms = parseIsoDate(to).getTime() - parseIsoDate(from).getTime();
  return Math.round(ms / 86_400_000);
}

// Assignment.weekStart is the ISO date of that week's Monday.
export function mondayOf(date = new Date()): string {
  const monday = new Date(date);
  const day = monday.getDay(); // 0 = Sunday → previous Monday
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return isoDate(monday);
}
