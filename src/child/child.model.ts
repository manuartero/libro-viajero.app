import { PALETTE } from "src/palette/palette.data";

export type Child = {
  id: string;
  tag: string; // teacher-chosen nickname, max 20 chars — never a real name
  emoji: string;
  color: string;
};

export type ChildDraft = Omit<Child, "id">;

export function pluralPeques(count: number) {
  if (count === 1) {
    return "1 peque";
  }
  return `${count} peques`;
}

export function nextUnusedColor(usedColors: readonly string[]) {
  const unused = PALETTE.find(({ color }) => !usedColors.includes(color));
  return (unused ?? PALETTE[usedColors.length % PALETTE.length]).color;
}
