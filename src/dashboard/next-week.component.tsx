import { useId } from "react";
import { ChildAvatar } from "src/child/child-avatar.component";
import type { Project } from "src/project/project.model";
import styles from "./next-week.module.css";

type NextWeekPanelProps = {
  project: Project;
  returnedChildIds: string[];
};

// Placeholder rotation: shift returned books by one position.
// The real algorithm (history-aware, greedy with backtracking) is specced
// in issue #5, to land as services/rotation.service.ts.
const shiftSuggestions = ({
  project,
  returnedChildIds,
}: NextWeekPanelProps) => {
  const returned = project.currentAssignments.filter((a) =>
    returnedChildIds.includes(a.childId),
  );
  return returned.map((assignment, i) => ({
    bookId: assignment.bookId,
    childId: returned[(i + 1) % returned.length].childId,
  }));
};

export function NextWeekPanel({
  project,
  returnedChildIds,
}: NextWeekPanelProps) {
  const titleId = useId();

  const suggestions = shiftSuggestions({ project, returnedChildIds });

  const childById = new Map(project.children.map((child) => [child.id, child]));
  const bookById = new Map(project.books.map((book) => [book.id, book]));

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Próxima semana
      </h2>
      {suggestions.length === 0 && (
        <p className={styles.empty}>
          Marca los libros devueltos para ver la sugerencia
        </p>
      )}

      {suggestions.length > 0 && (
        <ul className={styles.list}>
          {suggestions.map(({ bookId, childId }) => {
            const child = childById.get(childId);
            const book = bookById.get(bookId);
            if (!child || !book) {
              return null;
            }
            return (
              <li key={bookId} className={styles.row}>
                <span className={styles.book}>{book.title}</span>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
                <span className={styles.child}>
                  <ChildAvatar
                    emoji={child.emoji}
                    color={child.color}
                    size="tiny"
                  />
                  {child.tag}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
