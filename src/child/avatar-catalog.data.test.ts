import {
  AVATAR_COLORS,
  EMOJI_PANELS,
  nextUnusedColor,
} from "src/child/avatar-catalog.data";
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

describe("EMOJI_PANELS{}", () => {
  // Two children sharing an emoji would be indistinguishable on the
  // dashboard, and the builder's "en uso" marker would point at both.
  it("never offers the same emoji on two panels", () => {
    const emojis = EMOJI_PANELS.flatMap((panel) =>
      panel.emojis.map(({ emoji }) => emoji),
    );
    expect(new Set(emojis).size).toBe(emojis.length);
  });
});
