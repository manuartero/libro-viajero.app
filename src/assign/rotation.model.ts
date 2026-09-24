import { type Project, pairsFrom } from "src/project/project.model";

function lastHolderOf({
  bookId,
  project,
}: {
  bookId: string;
  project: Project;
}) {
  const live = project.currentAssignments.find((a) => a.bookId === bookId);
  if (live) {
    return live.childId;
  }
  return project.history.filter((a) => a.bookId === bookId).at(-1)?.childId;
}

export function rotatePairs(project: Project) {
  const pairs = pairsFrom(project.currentAssignments);
  const circle = project.children.map((child) => child.id);
  const seatOf = new Map(circle.map((childId, seat) => [childId, seat]));
  const heldBookIds = new Set(Object.values(pairs));

  const freeBooks = project.books
    .filter((book) => !heldBookIds.has(book.id))
    .map((book) => {
      const holderId = lastHolderOf({ bookId: book.id, project });
      const holderSeat = holderId === undefined ? -1 : seatOf.get(holderId);
      return { bookId: book.id, holderSeat: holderSeat ?? -1 };
    });
  const read = freeBooks.filter((book) => book.holderSeat >= 0);
  const unread = freeBooks.filter((book) => book.holderSeat < 0);
  read.sort((a, b) => a.holderSeat - b.holderSeat);

  for (const { bookId, holderSeat } of [...read, ...unread]) {
    for (let step = 1; step <= circle.length; step++) {
      const childId = circle[(holderSeat + step) % circle.length];
      if (!pairs[childId]) {
        pairs[childId] = bookId;
        break;
      }
    }
  }
  return pairs;
}
