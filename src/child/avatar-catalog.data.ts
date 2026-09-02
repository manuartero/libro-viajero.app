// Curated avatar catalog (SPEC F3): no human faces — an avatar must never
// resemble a real child. Consumers render these as a tap-only grid, never
// free emoji input. Each emoji ships a Spanish nickname suggestion so adding
// a child can be pure tapping — the teacher only types if she wants to.

export type CuratedEmoji = {
  emoji: string;
  name: string;
};

export type EmojiPanel = {
  id: string;
  label: string;
  emojis: readonly CuratedEmoji[];
};

export const EMOJI_PANELS = [
  {
    id: "animales",
    label: "Animales",
    emojis: [
      { emoji: "🐸", name: "Rana" },
      { emoji: "🦊", name: "Zorro" },
      { emoji: "🐼", name: "Panda" },
      { emoji: "🐯", name: "Tigre" },
      { emoji: "🦁", name: "León" },
      { emoji: "🐰", name: "Conejo" },
      { emoji: "🦉", name: "Búho" },
      { emoji: "🦕", name: "Dino" },
      { emoji: "🐙", name: "Pulpo" },
      { emoji: "🐢", name: "Tortuga" },
      { emoji: "🦋", name: "Mariposa" },
      { emoji: "🐝", name: "Abeja" },
      { emoji: "🐬", name: "Delfín" },
      { emoji: "🐘", name: "Elefante" },
      { emoji: "🦒", name: "Jirafa" },
      { emoji: "🐨", name: "Koala" },
      { emoji: "🐺", name: "Lobo" },
      { emoji: "🦔", name: "Erizo" },
      { emoji: "🐌", name: "Caracol" },
      { emoji: "🦜", name: "Loro" },
    ],
  },
  {
    id: "naturaleza",
    label: "Naturaleza",
    emojis: [
      { emoji: "🌞", name: "Sol" },
      { emoji: "🌙", name: "Luna" },
      { emoji: "⭐", name: "Estrella" },
      { emoji: "🍓", name: "Fresa" },
      { emoji: "🌈", name: "Arcoíris" },
      { emoji: "🌻", name: "Girasol" },
      { emoji: "🌵", name: "Cactus" },
      { emoji: "🍄", name: "Seta" },
      { emoji: "🌊", name: "Ola" },
      { emoji: "❄️", name: "Copo" },
      { emoji: "🌲", name: "Pino" },
      { emoji: "🍁", name: "Hoja" },
      { emoji: "🌸", name: "Flor" },
      { emoji: "🍀", name: "Trébol" },
      { emoji: "🌋", name: "Volcán" },
      { emoji: "⛅", name: "Nube" },
      { emoji: "🍒", name: "Cereza" },
      { emoji: "🍉", name: "Sandía" },
      { emoji: "⚡", name: "Rayo" },
      { emoji: "🐚", name: "Concha" },
    ],
  },
  {
    id: "objetos",
    label: "Objetos",
    emojis: [
      { emoji: "🚀", name: "Cohete" },
      { emoji: "🤖", name: "Robot" },
      { emoji: "🧸", name: "Osito" },
      { emoji: "🎈", name: "Globo" },
      { emoji: "🎨", name: "Pincel" },
      { emoji: "📚", name: "Libro" },
      { emoji: "✏️", name: "Lápiz" },
      { emoji: "🎸", name: "Guitarra" },
      { emoji: "🚲", name: "Bici" },
      { emoji: "⚽", name: "Balón" },
      { emoji: "🪁", name: "Cometa" },
      { emoji: "🚂", name: "Tren" },
      { emoji: "⛵", name: "Barco" },
      { emoji: "🧩", name: "Puzle" },
      { emoji: "🎩", name: "Sombrero" },
      { emoji: "🔑", name: "Llave" },
      { emoji: "🎁", name: "Regalo" },
      { emoji: "⏰", name: "Reloj" },
      { emoji: "🪀", name: "Yoyó" },
      { emoji: "🎪", name: "Circo" },
    ],
  },
] as const satisfies readonly EmojiPanel[];

export const CURATED_EMOJIS: readonly CuratedEmoji[] = EMOJI_PANELS.flatMap(
  (panel): readonly CuratedEmoji[] => panel.emojis,
);

type AvatarColor = {
  color: string;
  name: string;
};

// Sorted by hue (warm → cool → neutral). Order is load-bearing:
// nextUnusedColor walks it front-to-back to auto-assign colors.
export const AVATAR_COLORS = [
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
] as const satisfies readonly AvatarColor[];

export function nextUnusedColor(usedColors: readonly string[]) {
  const unused = AVATAR_COLORS.find(({ color }) => !usedColors.includes(color));
  return (unused ?? AVATAR_COLORS[usedColors.length % AVATAR_COLORS.length])
    .color;
}
