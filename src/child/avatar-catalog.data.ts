import catalog from "./avatar-catalog.json";

// Curated avatar catalog (SPEC F3): no human faces — an avatar must never
// resemble a real child. The emoji list is raw data in avatar-catalog.json;
// this module is the only thing that reads it. Consumers render these as a
// tap-only grid, never free emoji input. Each emoji ships a Spanish nickname
// suggestion so adding a child can be pure tapping — the name is both the
// default nickname and the cell's accessible label.

export type CuratedEmoji = {
  emoji: string;
  name: string;
};

export const EMOJI_PANELS: readonly {
  label: string;
  emojis: readonly CuratedEmoji[];
}[] = catalog.panels;
