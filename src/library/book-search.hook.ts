import { useEffect, useRef, useState } from "react";
import type { BookDraft } from "src/book/book.model";
import { newId } from "src/lib/id";
import { searchBooks } from "src/services/open-library.service";

// Results get a transient key on arrival: drafts have no identity yet and
// Open Library can legitimately return duplicate titles.
export type SearchResult = { key: string; draft: BookDraft };

export type SearchState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "results"; results: SearchResult[] }
  | { status: "empty"; query: string }
  | { status: "error" };

// Owns the Open Library round trip and nothing else, so the component is left
// with the query box, the manual-entry form and markup.
export function useBookSearch() {
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runSearch = async (query: string) => {
    const title = query.trim();
    if (title.length === 0) {
      return;
    }
    // Superseding a request is the only staleness guard: an aborted response
    // never reaches setSearch, so results cannot arrive out of order.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearch({ status: "searching" });
    try {
      const drafts = await searchBooks({ title, signal: controller.signal });
      setSearch(
        drafts.length === 0
          ? { status: "empty", query: title }
          : {
              status: "results",
              results: drafts.map((draft) => ({ key: newId(), draft })),
            },
      );
    } catch (error) {
      if (!controller.signal.aborted) {
        // The UI blames connectivity; keep the real cause reachable in the
        // console (HTTP status errors and JSON parse failures land here too).
        console.error("libro-viajero: book search failed", error);
        setSearch({ status: "error" });
      }
    }
  };

  // Picking a result ends the search: the list has done its job, and a stale
  // list under a book that is already on the shelf invites a second tap.
  const clearSearch = () => {
    abortRef.current?.abort();
    setSearch({ status: "idle" });
  };

  return { search, runSearch, clearSearch };
}
