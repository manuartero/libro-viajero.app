export type PaletteColor = {
  color: string;
  name: string;
};

// The app's only palette, sorted by hue (warm → cool → neutral). Two things
// here are load-bearing and one is not:
//   length — coverColorFor()'s HUE_STRIDE must stay coprime with it, or cover
//     colors collapse onto a fraction of the palette (a length of 10 would
//     leave two), and nextUnusedColor() wraps on it.
//   membership — Child.color is persisted as a raw hex and never re-validated
//     on read, so dropping an entry leaves existing children on a color no
//     swatch matches: ColorPicker marks none of them aria-pressed.
//   order — cosmetic. It decides which hue nextUnusedColor() hands out first
//     and how the swatches line up. Reordering breaks nothing.
export const PALETTE = [
  { color: "#ff595e", name: "Coral" },
  { color: "#f3722c", name: "Naranja" },
  { color: "#ffca3a", name: "Amarillo" },
  { color: "#8ac926", name: "Verde" },
  { color: "#52a675", name: "Bosque" },
  { color: "#98c1d9", name: "Celeste" },
  { color: "#1982c4", name: "Océano" },
  { color: "#4267ac", name: "Azul" },
  { color: "#6a4c93", name: "Morado" },
  { color: "#f49cbb", name: "Rosa" },
  { color: "#b5838d", name: "Malva" },
  { color: "#8d99ae", name: "Gris" },
] as const satisfies readonly PaletteColor[];

export const PALETTE_COLORS: readonly string[] = PALETTE.map(
  ({ color }) => color,
);
