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

  it("spreads titles one character apart across distant hues", () => {
    expect(coverColorFor("Elmer")).not.toBe(coverColorFor("Elmes"));
  });
});
