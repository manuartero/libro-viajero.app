import type { Project } from "src/project/project.model";
import {
  addBook,
  addChild,
  distributeBooks,
  markReturned,
  pairsFrom,
  removeBook,
  removeChild,
  saveChild,
  setLoanWeeks,
  undoReturn,
} from "src/project/project.model";
import { describe, expect, it } from "vitest";

const baseProject = (): Project => ({
  id: "p1",
  name: "Clase Caracoles 26/27",
  children: [
    { id: "c1", tag: "Caracol", emoji: "🐌", color: "#8ac926" },
    { id: "c2", tag: "Zorro", emoji: "🦊", color: "#ffca3a" },
  ],
  books: [
    { id: "b1", title: "El Grúfalo" },
    { id: "b2", title: "Elmer" },
  ],
  currentAssignments: [
    { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
    { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
  ],
  history: [closedLoan],
});

// Caracol had Elmer the week before and brought it back on the Friday.
const closedLoan = {
  childId: "c1",
  bookId: "b2",
  weekStart: "2026-08-24",
  returnedOn: "2026-08-28",
};

describe("addChild()", () => {
  it("appends the draft with a fresh id", () => {
    const project = baseProject();
    const next = addChild({
      project,
      draft: { tag: "Búho", emoji: "🦉", color: "#6a4c93" },
    });
    expect(next.children).toHaveLength(3);
    expect(next.children[2].tag).toBe("Búho");
    expect(next.children[2].id).toBeTruthy();
    expect(project.children).toHaveLength(2);
  });
});

describe("saveChild()", () => {
  it("replaces the child with the same id", () => {
    const next = saveChild({
      project: baseProject(),
      child: { id: "c1", tag: "Caracola", emoji: "🐌", color: "#8ac926" },
    });
    expect(next.children.find((c) => c.id === "c1")?.tag).toBe("Caracola");
    expect(next.children).toHaveLength(2);
  });
});

describe("removeChild()", () => {
  it("removes the child and prunes their assignment", () => {
    const next = removeChild({ project: baseProject(), childId: "c1" });
    expect(next.children.map((c) => c.id)).toEqual(["c2"]);
    expect(next.currentAssignments).toEqual([
      { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
    ]);
  });

  it("closes their loan into history as one that never came back", () => {
    const next = removeChild({ project: baseProject(), childId: "c1" });
    expect(next.history).toEqual([
      closedLoan,
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
    ]);
  });
});

describe("addBook()", () => {
  it("appends the draft with a fresh id", () => {
    const next = addBook({
      project: baseProject(),
      draft: { title: "La cebra Camila", author: "Marisa Núñez" },
    });
    expect(next.books).toHaveLength(3);
    expect(next.books[2].title).toBe("La cebra Camila");
    expect(next.books[2].id).toBeTruthy();
  });
});

describe("distributeBooks()", () => {
  const friday = new Date(2026, 8, 4); // Fri 4 Sep, week of Mon 31 Aug

  it("keeps an unchanged pair as it was and dates a new one from today", () => {
    const next = distributeBooks({
      project: baseProject(),
      pairs: { c1: "b1", c2: "b2" },
      today: friday,
    });
    expect(next.currentAssignments).toEqual([
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
      { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
    ]);

    const swapped = distributeBooks({
      project: baseProject(),
      pairs: { c1: "b2", c2: "b1" },
      today: friday,
    });
    expect(swapped.currentAssignments).toEqual([
      {
        childId: "c1",
        bookId: "b2",
        weekStart: "2026-08-31",
        since: "2026-09-04",
      },
      {
        childId: "c2",
        bookId: "b1",
        weekStart: "2026-08-31",
        since: "2026-09-04",
      },
    ]);
  });

  it("allows a partial reparto", () => {
    const next = distributeBooks({
      project: baseProject(),
      pairs: { c2: "b1" },
      today: friday,
    });
    expect(next.currentAssignments).toEqual([
      {
        childId: "c2",
        bookId: "b1",
        weekStart: "2026-08-31",
        since: "2026-09-04",
      },
    ]);
  });

  it("drops pairs that reference a missing child or book", () => {
    const next = distributeBooks({
      project: baseProject(),
      pairs: { ghost: "b1", c1: "b-gone" },
    });
    expect(next.currentAssignments).toEqual([]);
  });

  it("gives a book claimed twice to the first child in class order", () => {
    const next = distributeBooks({
      project: baseProject(),
      pairs: { c1: "b1", c2: "b1" },
    });
    expect(next.currentAssignments).toEqual([
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
    ]);
  });

  it("closes every pairing it replaces into history, and leaves the input alone", () => {
    const project = baseProject();
    const next = distributeBooks({ project, pairs: { c1: "b2" } });

    // Zorro's Elmer goes to Caracol, so both old loans end with no return
    // recorded: Caracol's Grúfalo was dropped, Zorro's Elmer was taken.
    expect(next.history).toEqual([
      closedLoan,
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
      { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
    ]);
    expect(project.currentAssignments).toHaveLength(2);
    expect(project.history).toHaveLength(1);
  });

  it("starts a returned book over as a new loan, even with the same child", () => {
    const project = markReturned({
      project: baseProject(),
      childId: "c1",
      today: friday,
    });
    const next = distributeBooks({
      project,
      pairs: { c1: "b1", c2: "b2" },
      today: friday,
    });

    expect(next.currentAssignments).toEqual([
      {
        childId: "c1",
        bookId: "b1",
        weekStart: "2026-08-31",
        since: "2026-09-04",
      },
      { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
    ]);
    expect(next.history).toEqual([
      closedLoan,
      {
        childId: "c1",
        bookId: "b1",
        weekStart: "2026-08-31",
        returnedOn: "2026-09-04",
      },
    ]);
  });
});

describe("setLoanWeeks()", () => {
  it("records the class-wide loan length and nothing else", () => {
    const next = setLoanWeeks({ project: baseProject(), loanWeeks: 2 });

    expect(next.loanWeeks).toBe(2);
    expect(next.currentAssignments).toEqual(baseProject().currentAssignments);
  });
});

describe("removeBook()", () => {
  it("removes the book and prunes its assignment", () => {
    const next = removeBook({ project: baseProject(), bookId: "b2" });
    expect(next.books.map((b) => b.id)).toEqual(["b1"]);
    expect(next.currentAssignments).toEqual([
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
    ]);
  });

  it("closes its loan into history, keeping a return already recorded", () => {
    const project = markReturned({
      project: baseProject(),
      childId: "c1",
      today: new Date(2026, 8, 11),
    });
    const next = removeBook({ project, bookId: "b1" });
    expect(next.history).toEqual([
      closedLoan,
      {
        childId: "c1",
        bookId: "b1",
        weekStart: "2026-08-31",
        returnedOn: "2026-09-11",
      },
    ]);
  });
});

describe("markReturned()", () => {
  it("dates the child's live assignment as returned today", () => {
    const next = markReturned({
      project: baseProject(),
      childId: "c2",
      today: new Date(2026, 8, 11),
    });

    expect(next.currentAssignments).toEqual([
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
      {
        childId: "c2",
        bookId: "b2",
        weekStart: "2026-08-31",
        returnedOn: "2026-09-11",
      },
    ]);
    expect(next.history).toEqual([closedLoan]);
  });
});

describe("undoReturn()", () => {
  it("puts the book back in the child's hands", () => {
    const returned = markReturned({ project: baseProject(), childId: "c2" });
    const next = undoReturn({ project: returned, childId: "c2" });

    expect(next.currentAssignments).toEqual(baseProject().currentAssignments);
    expect(next.currentAssignments[1]).not.toHaveProperty("returnedOn");
  });
});

describe("pairsFrom()", () => {
  it("pairs the books still out and leaves a returned one off", () => {
    const pairs = pairsFrom([
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
      {
        childId: "c2",
        bookId: "b2",
        weekStart: "2026-08-31",
        returnedOn: "2026-09-11",
      },
    ]);

    expect(pairs).toEqual({ c1: "b1" });
  });
});
