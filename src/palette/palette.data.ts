import palette from "./palette.json";

export type PaletteColor = {
  color: string;
  name: string;
};

// The app's only palette, sorted by hue (warm → cool → neutral). Adding and
// removing entries is not free — see AGENTS.md § Design language.
export const PALETTE: readonly PaletteColor[] = palette;
