import { useState } from "react";
import type { Book } from "src/book/book.model";
import type { Child } from "src/child/child.model";
import type { Assignment, AssignmentPairs } from "src/project/project.model";
import { pairsFrom } from "src/project/project.model";

// Owns the reparto in progress and nothing else, so the screen is left with
// markup: which child is being served, which books are still on the tray, and
// the two edits a teacher can make.
export function useAssignmentDraft({
  children,
  books,
  currentAssignments,
}: {
  children: readonly Child[];
  books: readonly Book[];
  currentAssignments: readonly Assignment[];
}) {
  const [pairs, setPairs] = useState<AssignmentPairs>(() =>
    pairsFrom(currentAssignments),
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Nobody selected means "serve the next child without a book", so the
  // teacher can tap books one after another without aiming first.
  const firstUnassignedId =
    children.find((child) => !pairs[child.id])?.id ?? null;
  const activeChildId = selectedChildId ?? firstUnassignedId;

  const assignedBookIds = new Set(Object.values(pairs));
  const trayBooks = books.filter((book) => !assignedBookIds.has(book.id));
  const bookById = new Map(books.map((book) => [book.id, book]));
  const assignedCount = children.filter((child) => pairs[child.id]).length;

  const assignToActive = (bookId: string) => {
    if (activeChildId === null) {
      return;
    }
    setPairs((prev) => {
      const next = { ...prev };
      // One book, one child: strip the book from any other pairing.
      for (const childId of Object.keys(next)) {
        if (next[childId] === bookId) {
          delete next[childId];
        }
      }
      next[activeChildId] = bookId;
      return next;
    });
    setSelectedChildId(null); // advance to the next unassigned child
  };

  const unassign = (childId: string) => {
    setPairs((prev) => {
      const next = { ...prev };
      delete next[childId];
      return next;
    });
  };

  const toggleSelected = (childId: string) => {
    setSelectedChildId((prev) => (prev === childId ? null : childId));
  };

  return {
    pairs,
    activeChildId,
    trayBooks,
    bookById,
    assignedCount,
    assignToActive,
    unassign,
    toggleSelected,
  };
}
