import { currentSchoolYear, schoolYearFrom } from "src/project/school-year";
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
  it("treats summer setup as the upcoming course", () => {
    expect(currentSchoolYear(new Date(2026, 7, 30)).label).toBe("2026/2027");
  });

  it("starts the upcoming course in July", () => {
    expect(currentSchoolYear(new Date(2026, 6, 1)).start).toBe(2026);
    expect(currentSchoolYear(new Date(2026, 5, 30)).start).toBe(2025);
  });

  it("keeps the running course during winter and spring", () => {
    expect(currentSchoolYear(new Date(2027, 0, 15)).label).toBe("2026/2027");
    expect(currentSchoolYear(new Date(2027, 4, 20)).label).toBe("2026/2027");
  });
});
