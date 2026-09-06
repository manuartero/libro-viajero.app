import { loanLogOf } from "src/project/loan-log.model";
import type { Project } from "src/project/project.model";
import { describe, expect, it } from "vitest";

const elmer = { id: "b1", title: "Elmer" };
const monstruo = { id: "b2", title: "El monstruo de colores" };

const project = (overrides?: Partial<Project>): Project => ({
  id: "p1",
  name: "Los Caracoles 2026/27",
  children: [{ id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" }],
  books: [elmer, monstruo],
  currentAssignments: [],
  history: [],
  ...overrides,
});

// Rana took Elmer home on Fri 4 Sep 2026 (week of Mon 31 Aug).
const elmerLoan = {
  childId: "c1",
  bookId: "b1",
  weekStart: "2026-08-31",
  since: "2026-09-04",
};
const monstruoLoan = {
  childId: "c1",
  bookId: "b2",
  weekStart: "2026-09-14",
  since: "2026-09-18",
};

describe("loanLogOf()", () => {
  it("is empty for a child who never took a book home", () => {
    expect(loanLogOf({ project: project(), childId: "c1" })).toEqual([]);
  });

  it("lists the live assignment as the book being read", () => {
    const log = loanLogOf({
      project: project({ currentAssignments: [elmerLoan] }),
      childId: "c1",
    });

    expect(log).toEqual([
      { book: elmer, since: "2026-09-04", status: "reading" },
    ]);
  });

  it("dates a return by the day the book was checked in, closed or not", () => {
    const returned = { ...elmerLoan, returnedOn: "2026-09-11" };
    const expected = [
      {
        book: elmer,
        since: "2026-09-04",
        status: "returned",
        returnedOn: "2026-09-11",
      },
    ];

    // Checked in and waiting for the next reparto...
    expect(
      loanLogOf({
        project: project({ currentAssignments: [returned] }),
        childId: "c1",
      }),
    ).toEqual(expected);
    // ...reads the same once the reparto has closed it.
    expect(
      loanLogOf({ project: project({ history: [returned] }), childId: "c1" }),
    ).toEqual(expected);
  });

  it("orders newest first and marks a loan that ended without a return", () => {
    const log = loanLogOf({
      project: project({
        history: [elmerLoan, { ...monstruoLoan, returnedOn: "2026-09-25" }],
        currentAssignments: [
          { childId: "c1", bookId: "b1", weekStart: "2026-09-28" },
        ],
      }),
      childId: "c1",
    });

    expect(log.map((record) => [record.book?.title, record.status])).toEqual([
      ["Elmer", "reading"],
      ["El monstruo de colores", "returned"],
      ["Elmer", "unreturned"],
    ]);
  });

  it("leaves other children's loans out", () => {
    const log = loanLogOf({
      project: project({
        history: [{ ...elmerLoan, childId: "c2", returnedOn: "2026-09-11" }],
      }),
      childId: "c1",
    });

    expect(log).toEqual([]);
  });

  it("keeps the line when the book has since left the library", () => {
    const log = loanLogOf({
      project: project({
        books: [],
        history: [{ ...elmerLoan, returnedOn: "2026-09-11" }],
      }),
      childId: "c1",
    });

    expect(log[0].book).toBeUndefined();
    expect(log[0].status).toBe("returned");
  });

  it("falls back to the week's Monday when the day out is unknown", () => {
    const log = loanLogOf({
      project: project({
        currentAssignments: [
          { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
        ],
      }),
      childId: "c1",
    });

    expect(log[0].since).toBe("2026-08-31");
  });
});
