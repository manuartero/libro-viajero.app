// YYYY-MM-DD in the teacher's own calendar. Formatted via local getters:
// toISOString() is UTC, which shifts the date before 01:00/02:00 in Spain.
export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${dayOfMonth}`;
}

// Assignment.weekStart is the ISO date of that week's Monday (docs/DATA_MODEL.md).
export function mondayOf(date = new Date()): string {
  const monday = new Date(date);
  const day = monday.getDay(); // 0 = Sunday → previous Monday
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return isoDate(monday);
}
