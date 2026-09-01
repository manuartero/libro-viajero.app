import {
  AVATAR_COLORS,
  CURATED_EMOJIS,
  type CuratedEmoji,
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
  it("offers three categories of twenty emojis each", () => {
    expect(EMOJI_PANELS.map((panel) => panel.label)).toEqual([
      "Animales",
      "Naturaleza",
      "Objetos",
    ]);
    for (const panel of EMOJI_PANELS) {
      expect(panel.emojis).toHaveLength(20);
    }
  });

  it("has no duplicate emojis across panels", () => {
    const emojis = CURATED_EMOJIS.map(({ emoji }) => emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });

  it("flattens into the full curated catalog", () => {
    expect(CURATED_EMOJIS).toEqual(
      EMOJI_PANELS.flatMap((panel): readonly CuratedEmoji[] => panel.emojis),
    );
    expect(CURATED_EMOJIS).toHaveLength(60);
  });
});
