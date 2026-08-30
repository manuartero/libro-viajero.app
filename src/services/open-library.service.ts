import type { BookDraft } from "src/book/book.model";

type SearchDoc = {
  title?: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
};

const SEARCH_URL = "https://openlibrary.org/search.json";
const REQUEST_TIMEOUT_MS = 8_000;

// ?default=false makes a missing cover 404 so <img onError> can swap in the
// placeholder — without it the covers CDN serves a 1×1 GIF that loads "fine".
const coverUrlFrom = (coverId: number) =>
  `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`;

export async function searchBooks({
  title,
  signal,
}: {
  title: string;
  signal?: AbortSignal;
}): Promise<BookDraft[]> {
  const url = `${SEARCH_URL}?title=${encodeURIComponent(title)}&limit=8&fields=title,author_name,cover_i,isbn`;
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) {
    throw new Error(`Open Library respondió ${response.status}`);
  }
  const payload = (await response.json()) as { docs?: SearchDoc[] };
  return (payload.docs ?? [])
    .filter((doc): doc is SearchDoc & { title: string } => Boolean(doc.title))
    .map((doc) => ({
      title: doc.title,
      author: doc.author_name?.[0],
      coverUrl:
        doc.cover_i === undefined ? undefined : coverUrlFrom(doc.cover_i),
      isbn: doc.isbn?.[0],
    }));
}
