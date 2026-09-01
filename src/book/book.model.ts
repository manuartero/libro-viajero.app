export type Book = {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  isbn?: string;
};

// A book being composed in the setup flow: identity is assigned on creation.
export type BookDraft = Omit<Book, "id">;

// Same hues as the avatar palette, but owned here so the book domain
// never imports from child/.
export const COVER_PLACEHOLDER_COLORS = [
  "#8ac926",
  "#ffca3a",
  "#6a4c93",
  "#4267ac",
  "#52a675",
  "#ff595e",
  "#1982c4",
  "#b5838d",
  "#98c1d9",
  "#f3722c",
  "#f49cbb",
  "#8d99ae",
] as const;

// Cached: called on every render of every placeholder cover, and titles are
// few and stable within a session.
const coverColorCache = new Map<string, string>();

// Deterministic so a book keeps its placeholder color across renders and reloads.
export function coverColorFor(title: string): string {
  const cached = coverColorCache.get(title);
  if (cached !== undefined) {
    return cached;
  }
  let sum = 0;
  for (const char of title) {
    sum += char.codePointAt(0) ?? 0;
  }
  const color = COVER_PLACEHOLDER_COLORS[sum % COVER_PLACEHOLDER_COLORS.length];
  coverColorCache.set(title, color);
  return color;
}
