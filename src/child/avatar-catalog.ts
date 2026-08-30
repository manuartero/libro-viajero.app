// Curated avatar building blocks: no faces, no keyboard input.
// Each emoji ships a Spanish nickname suggestion so adding a child
// can be pure tapping — the teacher only types if she wants to.

export type CuratedEmoji = {
  emoji: string;
  name: string;
};

export const CURATED_EMOJIS: CuratedEmoji[] = [
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
  { emoji: "🚀", name: "Cohete" },
  { emoji: "🤖", name: "Robot" },
  { emoji: "🧸", name: "Osito" },
  { emoji: "🎈", name: "Globo" },
  { emoji: "⭐", name: "Estrella" },
  { emoji: "🌙", name: "Luna" },
  { emoji: "🌞", name: "Sol" },
  { emoji: "🍓", name: "Fresa" },
];

export type AvatarColor = {
  color: string;
  name: string;
};

export const AVATAR_COLORS: AvatarColor[] = [
  { color: "#8ac926", name: "Verde" },
  { color: "#ffca3a", name: "Amarillo" },
  { color: "#6a4c93", name: "Morado" },
  { color: "#4267ac", name: "Azul" },
  { color: "#52a675", name: "Bosque" },
  { color: "#ff595e", name: "Coral" },
  { color: "#1982c4", name: "Océano" },
  { color: "#b5838d", name: "Malva" },
  { color: "#98c1d9", name: "Celeste" },
  { color: "#f3722c", name: "Naranja" },
  { color: "#f49cbb", name: "Rosa" },
  { color: "#8d99ae", name: "Gris" },
];

export function nextUnusedColor(usedColors: string[]) {
  const unused = AVATAR_COLORS.find(({ color }) => !usedColors.includes(color));
  return (unused ?? AVATAR_COLORS[usedColors.length % AVATAR_COLORS.length])
    .color;
}
