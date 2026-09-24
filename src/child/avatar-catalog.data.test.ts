import { EMOJI_PANELS } from "src/child/avatar-catalog.data";
import { describe, expect, it } from "vitest";

describe("EMOJI_PANELS{}", () => {
  it("has no duplicate emojis across panels", () => {
    const emojis = EMOJI_PANELS.flatMap((panel) =>
      panel.emojis.map(({ emoji }) => emoji),
    );
    expect(new Set(emojis).size).toBe(emojis.length);
  });
});
