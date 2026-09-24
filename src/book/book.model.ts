import { PALETTE } from "src/palette/palette.data";

export type Book = {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  isbn?: string;
};

export type BookDraft = Omit<Book, "id">;

export function booksById(books: readonly Book[]) {
  return new Map(books.map((book) => [book.id, book]));
}

export function coverColorFor(title: string) {
  let sum = 0;
  for (const char of title) {
    sum += char.codePointAt(0) ?? 0;
  }
  return PALETTE[sum % PALETTE.length].color;
}

export function pluralLibros(count: number) {
  if (count === 1) {
    return "1 libro";
  }
  return `${count} libros`;
}

export function librosDevueltos(count: number) {
  if (count === 1) {
    return "1 libro devuelto";
  }
  return `${count} libros devueltos`;
}
