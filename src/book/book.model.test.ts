import { PALETTE } from "src/palette/palette.data";
import { describe, expect, it } from "vitest";
import { coverColorFor } from "./book.model";

const PALETTE_COLORS = PALETTE.map(({ color }) => color);

describe("coverColorFor()", () => {
  it("is deterministic for the same title", () => {
    expect(coverColorFor("El monstruo de colores")).toBe(
      coverColorFor("El monstruo de colores"),
    );
  });

  it("always returns a palette color", () => {
    expect(PALETTE_COLORS).toContain(coverColorFor("Elmer"));
    expect(PALETTE_COLORS).toContain(coverColorFor(""));
    expect(PALETTE_COLORS).toContain(
      coverColorFor("🐛 La pequeña oruga glotona"),
    );
  });

  // The only test here that catches a hash which stops telling books apart:
  // both of the above still pass if every title comes back the same color.
  it("uses the whole palette across many titles", () => {
    const titles = Array.from({ length: 200 }, (_, index) => `Libro ${index}`);
    expect(new Set(titles.map(coverColorFor)).size).toBe(PALETTE_COLORS.length);
  });
});
