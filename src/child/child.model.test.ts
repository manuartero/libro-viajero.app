import { nextUnusedColor } from "src/child/child.model";
import { PALETTE } from "src/palette/palette.data";
import { describe, expect, it } from "vitest";

const PALETTE_COLORS = PALETTE.map(({ color }) => color);

describe("nextUnusedColor()", () => {
  it("returns the first color not yet in use", () => {
    expect(nextUnusedColor([PALETTE_COLORS[0]])).toBe(PALETTE_COLORS[1]);
  });

  it("wraps to a valid palette color when every color is used", () => {
    expect(PALETTE_COLORS).toContain(nextUnusedColor(PALETTE_COLORS));
    expect(PALETTE_COLORS).toContain(
      nextUnusedColor([...PALETTE_COLORS, ...PALETTE_COLORS]),
    );
  });
});
