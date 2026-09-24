import { type ChangeEvent, type FormEvent, useState } from "react";
import type { BookDraft } from "src/book/book.model";
import { BookCover } from "src/book/book-cover.component";
import { type SearchState, useBookSearch } from "src/library/book-search.hook";
import styles from "./book-search.module.css";

type BookSearchProps = {
  // Whether the save persisted; on false the form stays for a retry.
  onAdd: (draft: BookDraft) => boolean;
};

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
  const { search, runSearch, clearSearch } = useBookSearch();

  const add = (draft: BookDraft) => {
    if (!onAdd(draft)) {
      return false;
    }
    setQuery("");
    clearSearch();
    setAddedTitle(draft.title);
    return true;
  };

  const addManual = (draft: BookDraft) => {
    if (add(draft)) {
      setManualOpen(false);
    }
  };

  const typeQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setAddedTitle(null);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddedTitle(null);
    runSearch(query);
  };

  return (
    <div className={styles.search}>
      <form className={styles.form} onSubmit={submitSearch}>
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
            onChange={typeQuery}
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
            <SearchResult key={key} draft={draft} onAdd={() => add(draft)} />
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
        <ManualBookForm
          initialTitle={query.trim()}
          onAdd={addManual}
          onCancel={() => setManualOpen(false)}
        />
      )}

      {!manualOpen && (
        <button
          type="button"
          className={styles.manualToggle}
          onClick={() => setManualOpen(true)}
        >
          {manualToggleLabel(search.status)}
        </button>
      )}
    </div>
  );
}

function SearchResult({
  draft,
  onAdd,
}: {
  draft: BookDraft;
  onAdd: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={styles.result}
        aria-label={resultLabel(draft)}
        onClick={onAdd}
      >
        <BookCover book={draft} size="small" />
        <span className={styles.resultText}>
          <span className={styles.resultTitle}>{draft.title}</span>
          {draft.author && (
            <span className={styles.resultAuthor}>{draft.author}</span>
          )}
        </span>
      </button>
    </li>
  );
}

function ManualBookForm({
  initialTitle,
  onAdd,
  onCancel,
}: {
  initialTitle: string;
  onAdd: (draft: BookDraft) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length === 0) {
      return;
    }
    onAdd({ title: title.trim(), author: author.trim() || undefined });
  };

  return (
    <form className={styles.manualForm} onSubmit={submit}>
      <ManualField
        id="manual-title"
        label="Título"
        value={title}
        onChange={setTitle}
      />
      <ManualField
        id="manual-author"
        label="Autor (opcional)"
        value={author}
        onChange={setAuthor}
      />
      <div className={styles.manualActions}>
        <button
          type="submit"
          className={styles.submit}
          disabled={title.trim().length === 0}
        >
          Añadir libro
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ManualField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.manualField}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="text"
        value={value}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
