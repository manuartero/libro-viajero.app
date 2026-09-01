import { describe, expect, it } from "vitest";
import { COVER_PLACEHOLDER_COLORS, coverColorFor } from "./book.model";

describe("coverColorFor()", () => {
  it("is deterministic for the same title", () => {
    expect(coverColorFor("El monstruo de colores")).toBe(
      coverColorFor("El monstruo de colores"),
    );
  });

  it("always returns a palette color", () => {
    const colors: readonly string[] = COVER_PLACEHOLDER_COLORS;
    expect(colors).toContain(coverColorFor("Elmer"));
    expect(colors).toContain(coverColorFor(""));
    expect(colors).toContain(coverColorFor("🐛 La pequeña oruga glotona"));
  });
});
