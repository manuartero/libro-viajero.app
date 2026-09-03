import {
  CURATED_EMOJIS,
  type CuratedEmoji,
  EMOJI_PANELS,
  nextUnusedColor,
} from "src/child/avatar-catalog.data";
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
