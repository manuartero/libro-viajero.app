import catalog from "./avatar-catalog.json";

// No human faces (SPEC F3): an avatar must never resemble a real child.

export type CuratedEmoji = {
  emoji: string;
  name: string;
};

export const EMOJI_PANELS: readonly {
  label: string;
  emojis: readonly CuratedEmoji[];
}[] = catalog.panels;
