import palette from "./palette.json";

export type PaletteColor = {
  color: string;
  name: string;
};

// Removing an entry strands persisted children — see AGENTS.md § Design language.
export const PALETTE: readonly PaletteColor[] = palette;
