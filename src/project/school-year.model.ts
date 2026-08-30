export type SchoolYear = {
  start: number; // calendar year the course starts in, e.g. 2026
  label: string; // "2026/2027"
  short: string; // "2026/27"
};

export function schoolYearFrom(start: number): SchoolYear {
  const end = start + 1;
  return {
    start,
    label: `${start}/${end}`,
    short: `${start}/${String(end % 100).padStart(2, "0")}`,
  };
}

// July onwards counts as the upcoming course: teachers set up
// their classroom during the summer, before September starts.
export function currentSchoolYear(today = new Date()): SchoolYear {
  const start =
    today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
  return schoolYearFrom(start);
}
