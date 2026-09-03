import { PALETTE } from "src/palette/palette.data";
import catalog from "./avatar-catalog.json";

// Curated avatar catalog (SPEC F3): no human faces — an avatar must never
// resemble a real child. The emoji list is raw data in avatar-catalog.json;
// this module is the only thing that reads it. Consumers render these as a
// tap-only grid, never free emoji input. Each emoji ships a Spanish nickname
// suggestion so adding a child can be pure tapping.

export type CuratedEmoji = {
  emoji: string;
  name: string;
};

export type EmojiPanel = {
  id: string;
  label: string;
  emojis: readonly CuratedEmoji[];
};

export const EMOJI_PANELS: readonly EmojiPanel[] = catalog.panels;

export const CURATED_EMOJIS: readonly CuratedEmoji[] = EMOJI_PANELS.flatMap(
  (panel): readonly CuratedEmoji[] => panel.emojis,
);

// Walks the shared palette front-to-back, so early children get distinct hues.
export function nextUnusedColor(usedColors: readonly string[]) {
  const unused = PALETTE.find(({ color }) => !usedColors.includes(color));
  return (unused ?? PALETTE[usedColors.length % PALETTE.length]).color;
}
