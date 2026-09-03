import { PALETTE } from "src/palette/palette.data";

export type Book = {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  isbn?: string;
};

// identity is assigned on creation.
export type BookDraft = Omit<Book, "id">;

// Deterministic so a book keeps its placeholder color across renders and
// reloads. The stride is coprime with the palette length, so titles with
// near-identical codepoint sums land on far-apart hues instead of neighbours.
const HUE_STRIDE = 5;

export function coverColorFor(title: string): string {
  let sum = 0;
  for (const char of title) {
    sum += char.codePointAt(0) ?? 0;
  }
  return PALETTE[(sum * HUE_STRIDE) % PALETTE.length].color;
}
