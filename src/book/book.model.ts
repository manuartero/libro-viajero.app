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
// reloads. Two separate properties ride on this number, and they are not the
// same one: being coprime with the palette length is what makes every color
// reachable, while 5 specifically is what lands titles with near-identical
// codepoint sums five hues apart. Coprimality alone does not buy that — 1 and
// 11 are equally coprime yet put such titles on neighbouring hues.
const HUE_STRIDE = 5;

export function coverColorFor(title: string): string {
  let sum = 0;
  for (const char of title) {
    sum += char.codePointAt(0) ?? 0;
  }
  return PALETTE[(sum * HUE_STRIDE) % PALETTE.length].color;
}

export function bookTitleOf(book: Book | undefined) {
  if (!book) {
    return "sin libro";
  }
  return book.title;
}

export function pluralLibros(count: number) {
  if (count === 1) {
    return "1 libro";
  }
  return `${count} libros`;
}
