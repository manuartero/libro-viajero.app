import { useEffect, useRef, useState } from "react";
import type { BookDraft } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import { newId } from "src/lib/id";
import { searchBooks } from "src/services/open-library.service";
import styles from "./book-search.module.css";

// Results get a transient key on arrival: drafts have no identity yet and
// Open Library can legitimately return duplicate titles.
type SearchResult = { key: string; draft: BookDraft };

type SearchState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "results"; results: SearchResult[] }
  | { status: "empty"; query: string }
  | { status: "error" };

type BookSearchProps = {
  onAdd: (draft: BookDraft) => void;
};

export function BookSearch({ onAdd }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runSearch = async () => {
    const title = query.trim();
    if (title.length === 0) {
      return;
    }
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
    } catch {
      if (!controller.signal.aborted) {
        setSearch({ status: "error" });
      }
    }
  };

  const openManual = () => {
    setManualTitle(query.trim());
    setManualAuthor("");
    setManualOpen(true);
  };

  const addManual = () => {
    const title = manualTitle.trim();
    if (title.length === 0) {
      return;
    }
    const author = manualAuthor.trim();
    onAdd({ title, author: author.length > 0 ? author : undefined });
    setManualTitle("");
    setManualAuthor("");
    setManualOpen(false);
  };

  return (
    <div className={styles.search}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
      >
        <label className={styles.label} htmlFor="book-query">
          Busca un libro por título
        </label>
        <div className={styles.inputRow}>
          <input
            id="book-query"
            className={styles.input}
            type="search"
            value={query}
            placeholder="La pequeña oruga glotona"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="submit"
            className={styles.submit}
            disabled={
              query.trim().length === 0 || search.status === "searching"
            }
          >
            Buscar
          </button>
        </div>
      </form>

      {search.status === "searching" ? (
        <p className={styles.status} role="status">
          Buscando…
        </p>
      ) : null}

      {search.status === "results" ? (
        <ul className={styles.results}>
          {search.results.map(({ key, draft }) => (
            <li key={key}>
              <button
                type="button"
                className={styles.result}
                aria-label={
                  draft.author ? `${draft.title}, ${draft.author}` : draft.title
                }
                onClick={() => onAdd(draft)}
              >
                <BookCover
                  title={draft.title}
                  coverUrl={draft.coverUrl}
                  size="small"
                />
                <span className={styles.resultText}>
                  <span className={styles.resultTitle}>{draft.title}</span>
                  {draft.author ? (
                    <span className={styles.resultAuthor}>{draft.author}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {search.status === "empty" ? (
        <p className={styles.status}>No hemos encontrado «{search.query}»</p>
      ) : null}

      {search.status === "error" ? (
        <div className={styles.errorBox} role="alert">
          <p className={styles.status}>
            No se pudo buscar. Comprueba tu conexión.
          </p>
          <button type="button" className={styles.retry} onClick={runSearch}>
            Reintentar
          </button>
        </div>
      ) : null}

      {manualOpen ? (
        <form
          className={styles.manualForm}
          onSubmit={(event) => {
            event.preventDefault();
            addManual();
          }}
        >
          <div className={styles.manualField}>
            <label className={styles.label} htmlFor="manual-title">
              Título
            </label>
            <input
              id="manual-title"
              className={styles.input}
              type="text"
              value={manualTitle}
              autoComplete="off"
              onChange={(event) => setManualTitle(event.target.value)}
            />
          </div>
          <div className={styles.manualField}>
            <label className={styles.label} htmlFor="manual-author">
              Autor (opcional)
            </label>
            <input
              id="manual-author"
              className={styles.input}
              type="text"
              value={manualAuthor}
              autoComplete="off"
              onChange={(event) => setManualAuthor(event.target.value)}
            />
          </div>
          <div className={styles.manualActions}>
            <button
              type="submit"
              className={styles.submit}
              disabled={manualTitle.trim().length === 0}
            >
              Añadir libro
            </button>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => setManualOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className={styles.manualToggle}
          onClick={openManual}
        >
          {search.status === "empty" || search.status === "error"
            ? "Añadirlo a mano"
            : "¿No lo encuentras? Añádelo a mano"}
        </button>
      )}
    </div>
  );
}
