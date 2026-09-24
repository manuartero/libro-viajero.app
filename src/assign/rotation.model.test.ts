import { rotatePairs } from "src/assign/rotation.model";
import type { Assignment, Project } from "src/project/project.model";
import { describe, expect, it } from "vitest";

const child = (id: string) => ({ id, tag: id, emoji: "🐸", color: "#8ac926" });
const book = (id: string) => ({ id, title: id });

const returned = (childId: string, bookId: string): Assignment => ({
  childId,
  bookId,
  weekStart: "2026-09-14",
  returnedOn: "2026-09-18",
});
const stillOut = (childId: string, bookId: string): Assignment => ({
  childId,
  bookId,
  weekStart: "2026-09-14",
});
const closed = (childId: string, bookId: string): Assignment => ({
  childId,
  bookId,
  weekStart: "2026-09-07",
});

const classroom = ({
  children,
  books,
  currentAssignments = [],
  history = [],
}: {
  children: string[];
  books: string[];
  currentAssignments?: Assignment[];
  history?: Assignment[];
}): Project => ({
  id: "p1",
  name: "Clase Caracoles 26/27",
  children: children.map(child),
  books: books.map(book),
  currentAssignments,
  history,
});

describe("rotatePairs()", () => {
  it("moves every returned book one child clockwise, the last one back to the first", () => {
    const project = classroom({
      children: ["C1", "C2", "C3"],
      books: ["B1", "B2", "B3"],
      currentAssignments: [
        returned("C1", "B1"),
        returned("C2", "B2"),
        returned("C3", "B3"),
      ],
    });

    expect(rotatePairs(project)).toEqual({ C2: "B1", C3: "B2", C1: "B3" });
  });

  it("keeps a book still out with its child, so the book behind it skips ahead", () => {
    const project = classroom({
      children: ["C1", "C2", "C3"],
      books: ["B1", "B2", "B3"],
      currentAssignments: [
        returned("C1", "B1"),
        stillOut("C2", "B2"),
        returned("C3", "B3"),
      ],
    });

    expect(rotatePairs(project)).toEqual({ C2: "B2", C3: "B1", C1: "B3" });
  });

  it("with fewer books than children, hands them on to the children who waited", () => {
    const project = classroom({
      children: ["C1", "C2", "C3", "C4"],
      books: ["B1", "B2"],
      currentAssignments: [returned("C1", "B1"), returned("C2", "B2")],
    });

    expect(rotatePairs(project)).toEqual({ C2: "B1", C3: "B2" });
  });

  it("reads the last holder from history once the loan is closed", () => {
    const project = classroom({
      children: ["C1", "C2", "C3"],
      books: ["B1"],
      history: [closed("C1", "B1"), closed("C2", "B1")],
    });

    expect(rotatePairs(project)).toEqual({ C3: "B1" });
  });

  it("hands books nobody has read, or whose reader left, to the first children without one", () => {
    const project = classroom({
      children: ["C1", "C2", "C3"],
      books: ["B1", "NEW", "ORPHAN"],
      currentAssignments: [returned("C1", "B1")],
      history: [closed("GONE", "ORPHAN")],
    });

    expect(rotatePairs(project)).toEqual({ C2: "B1", C1: "NEW", C3: "ORPHAN" });
  });

  it("leaves a book on the tray when every child already has one", () => {
    const project = classroom({
      children: ["C1"],
      books: ["B1", "B2"],
    });

    expect(rotatePairs(project)).toEqual({ C1: "B1" });
  });
});
