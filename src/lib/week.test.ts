import { describe, expect, it } from "vitest";
import { mondayOf } from "./week";

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
});
