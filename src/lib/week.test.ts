import { describe, expect, it } from "vitest";
import { addDays, daysBetween, mondayOf, parseIsoDate } from "./week";

describe("mondayOf()", () => {
  it("returns the Monday of a midweek date", () => {
    expect(mondayOf(new Date(2026, 8, 2))).toBe("2026-08-31"); // Wed Sep 2
  });

  it("returns the same day for a Monday", () => {
    expect(mondayOf(new Date(2026, 7, 31))).toBe("2026-08-31");
  });

  it("returns the previous Monday for a Sunday", () => {
    expect(mondayOf(new Date(2026, 8, 6))).toBe("2026-08-31"); // Sun Sep 6
  });

  it("crosses month and year boundaries", () => {
    expect(mondayOf(new Date(2026, 0, 1))).toBe("2025-12-29"); // Thu Jan 1
  });

  it("formats as YYYY-MM-DD with zero padding", () => {
    expect(mondayOf(new Date(2026, 3, 8))).toBe("2026-04-06");
  });
});

describe("parseIsoDate()", () => {
  it("reads the date as a local calendar day, not UTC midnight", () => {
    const date = parseIsoDate("2026-08-31");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(31);
    expect(date.getHours()).toBe(0);
  });
});

describe("addDays()", () => {
  it("rolls over month ends", () => {
    expect(addDays({ iso: "2026-08-31", days: 7 })).toBe("2026-09-07");
  });
});

describe("daysBetween()", () => {
  it("counts whole days across a DST change", () => {
    // Spain leaves summer time on Sun 25 Oct 2026: still one day per day.
    expect(daysBetween({ from: "2026-10-23", to: "2026-10-27" })).toBe(4);
  });

  it("is negative when the end comes first", () => {
    expect(daysBetween({ from: "2026-09-10", to: "2026-09-08" })).toBe(-2);
  });
});
