import { PALETTE_COLORS } from "src/palette/palette.data";
import { describe, expect, it } from "vitest";
import { coverColorFor } from "./book.model";

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

  // Guards HUE_STRIDE being coprime with the palette length. A stride sharing a
  // factor with it still returns palette colors, but only reaches 12/gcd of
  // them — stride 6 would quietly leave the app with two cover colors.
  it("uses the whole palette across many titles", () => {
    const titles = Array.from({ length: 200 }, (_, index) => `Libro ${index}`);
    expect(new Set(titles.map(coverColorFor)).size).toBe(PALETTE_COLORS.length);
  });

  // Guards the other half, which coprimality does not imply: strides 1 and 11
  // reach every color yet land one-character-apart titles on neighbouring hues.
  it("puts titles one character apart on distant hues", () => {
    const hueOf = (title: string) =>
      PALETTE_COLORS.indexOf(coverColorFor(title));
    const shift = Math.abs(hueOf("Elmer") - hueOf("Elmes"));
    const distance = Math.min(shift, PALETTE_COLORS.length - shift);
    expect(distance).toBeGreaterThanOrEqual(3);
  });
});
