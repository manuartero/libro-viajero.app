import {
  currentSchoolYear,
  schoolYearFrom,
} from "src/project/school-year.model";
import { describe, expect, it } from "vitest";

describe("schoolYearFrom()", () => {
  it("builds the full and short labels", () => {
    expect(schoolYearFrom(2026)).toEqual({
      start: 2026,
      label: "2026/2027",
      short: "2026/27",
    });
  });

  it("pads the short label across a century boundary", () => {
    expect(schoolYearFrom(1999).short).toBe("1999/00");
  });
});

describe("currentSchoolYear()", () => {
  it("switches to the upcoming course in July", () => {
    expect(currentSchoolYear(new Date(2026, 5, 30)).start).toBe(2025); // Jun 30
    expect(currentSchoolYear(new Date(2026, 6, 1)).start).toBe(2026); // Jul 1
    expect(currentSchoolYear(new Date(2027, 0, 15)).label).toBe("2026/2027"); // mid-course
  });
});
