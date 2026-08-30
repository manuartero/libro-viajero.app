import { AVATAR_COLORS, nextUnusedColor } from "src/child/avatar-catalog.data";
import { describe, expect, it } from "vitest";

const palette = AVATAR_COLORS.map(({ color }) => color);

describe("nextUnusedColor()", () => {
  it("returns the first color not yet in use", () => {
    expect(nextUnusedColor([palette[0]])).toBe(palette[1]);
  });

  it("wraps to a valid palette color when every color is used", () => {
    expect(palette).toContain(nextUnusedColor(palette));
    expect(palette).toContain(nextUnusedColor([...palette, ...palette]));
  });
});
