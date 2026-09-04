import { useState } from "react";
import type { BookDraft } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import { type SearchState, useBookSearch } from "src/library/book-search.hook";
import styles from "./book-search.module.css";

type BookSearchProps = {
  // Returns whether the book was saved. On false the search results and the
  // manual form stay as they are, so the tap stays retryable.
  onAdd: (draft: BookDraft) => boolean;
};

// After a search that found nothing, the manual route is the obvious next
// step rather than a hint.
function manualToggleLabel(status: SearchState["status"]) {
  if (status === "empty" || status === "error") {
    return "Añadirlo a mano";
  }
  return "¿No lo encuentras? Añádelo a mano";
}

function resultLabel(draft: BookDraft) {
  if (!draft.author) {
    return draft.title;
  }
  return `${draft.title}, ${draft.author}`;
}

export function BookSearch({ onAdd }: BookSearchProps) {
  const [query, setQuery] = useState("");
  const [addedTitle, setAddedTitle] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const { search, runSearch, clearSearch } = useBookSearch();

  // The shelf below is the real confirmation, but it grows downwards and is
  // off-screen on a phone once a few books are on it. This line stays until
  // the next title is typed, so the tap has a visible ending either way.
  const add = (draft: BookDraft) => {
    if (!onAdd(draft)) {
      return false;
    }
    setQuery("");
    clearSearch();
    setAddedTitle(draft.title);
    return true;
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
    if (!add({ title, author: author.length > 0 ? author : undefined })) {
      return;
    }
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
          setAddedTitle(null);
          runSearch(query);
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
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setAddedTitle(null);
            }}
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

      {addedTitle && (
        <p className={styles.added} role="status">
          «{addedTitle}» añadido a la estantería
        </p>
      )}

      {search.status === "searching" && (
        <p className={styles.status} role="status">
          Buscando…
        </p>
      )}

      {search.status === "results" && (
        <ul className={styles.results}>
          {search.results.map(({ key, draft }) => (
            <li key={key}>
              <button
                type="button"
                className={styles.result}
                aria-label={resultLabel(draft)}
                onClick={() => add(draft)}
              >
                <BookCover
                  title={draft.title}
                  coverUrl={draft.coverUrl}
                  size="small"
                />
                <span className={styles.resultText}>
                  <span className={styles.resultTitle}>{draft.title}</span>
                  {draft.author && (
                    <span className={styles.resultAuthor}>{draft.author}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {search.status === "empty" && (
        <p className={styles.status}>No hemos encontrado «{search.query}»</p>
      )}

      {search.status === "error" && (
        <div className={styles.errorBox} role="alert">
          <p className={styles.status}>
            No se pudo buscar. Comprueba tu conexión.
          </p>
          <button
            type="button"
            className={styles.retry}
            onClick={() => runSearch(query)}
          >
            Reintentar
          </button>
        </div>
      )}

      {manualOpen && (
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
      )}

      {!manualOpen && (
        <button
          type="button"
          className={styles.manualToggle}
          onClick={openManual}
        >
          {manualToggleLabel(search.status)}
        </button>
      )}
    </div>
  );
}
