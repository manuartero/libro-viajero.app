export type PaletteColor = {
  color: string;
  name: string;
};

// The app's only palette. Sorted by hue (warm → cool → neutral); the order is
// load-bearing for every consumer that walks or indexes it.
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
