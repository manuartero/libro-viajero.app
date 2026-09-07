import { useEffect, useRef, useState } from "react";
import type { BookDraft } from "src/book/book.model";
import { newId } from "src/lib/id";
import { searchBooks } from "src/services/open-library.service";

// Drafts have no id yet and Open Library can return duplicate titles.
export type SearchResult = { key: string; draft: BookDraft };

export type SearchState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "results"; results: SearchResult[] }
  | { status: "empty"; query: string }
  | { status: "error" };

export function useBookSearch() {
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runSearch = async (query: string) => {
    const title = query.trim();
    if (title.length === 0) {
      return;
    }
    // Aborting the previous request is the staleness guard.
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
        console.error("libro-viajero: book search failed", error);
        setSearch({ status: "error" });
      }
    }
  };

  const clearSearch = () => {
    abortRef.current?.abort();
    setSearch({ status: "idle" });
  };

  return { search, runSearch, clearSearch };
}
