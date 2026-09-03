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
// reloads without the color ever being persisted.
export function coverColorFor(title: string): string {
  let sum = 0;
  for (const char of title) {
    sum += char.codePointAt(0) ?? 0;
  }
  return PALETTE[sum % PALETTE.length].color;
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
