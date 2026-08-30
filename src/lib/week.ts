// Assignment.weekStart is the ISO date of that week's Monday (docs/DATA_MODEL.md).
// Formatted via local getters: toISOString() is UTC, which shifts the date
// before 01:00/02:00 in Spain.
export function mondayOf(date = new Date()): string {
  const monday = new Date(date);
  const day = monday.getDay(); // 0 = Sunday → previous Monday
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(monday.getDate()).padStart(2, "0");
  return `${monday.getFullYear()}-${month}-${dayOfMonth}`;
}
