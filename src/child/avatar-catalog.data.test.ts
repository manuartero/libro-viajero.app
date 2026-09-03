import { EMOJI_PANELS } from "src/child/avatar-catalog.data";
import { describe, expect, it } from "vitest";

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

  // A repeat would collide as a React key and would read as "already in use"
  // on both cells the moment one child takes it.
  it("has no duplicate emojis across panels", () => {
    const emojis = EMOJI_PANELS.flatMap((panel) =>
      panel.emojis.map(({ emoji }) => emoji),
    );
    expect(new Set(emojis).size).toBe(emojis.length);
  });
});
