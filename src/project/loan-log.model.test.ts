import { loanLogOf } from "src/project/loan-log.model";
import type { Project, WeeklySession } from "src/project/project.model";
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

const session = ({
  weekStart,
  returned,
}: {
  weekStart: string;
  returned: boolean;
}): WeeklySession => ({
  weekStart,
  returnedChildIds: returned ? ["c1"] : [],
  missedChildIds: returned ? [] : ["c1"],
  assignments: [elmerLoan],
});

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

  it("dates a return by the Friday of the session that checked it in", () => {
    const log = loanLogOf({
      project: project({
        history: [session({ weekStart: "2026-09-07", returned: true })],
      }),
      childId: "c1",
    });

    expect(log).toEqual([
      {
        book: elmer,
        since: "2026-09-04",
        status: "returned",
        returnedFriday: "2026-09-11",
      },
    ]);
  });

  it("folds a book carried over unreturned into one loan", () => {
    const log = loanLogOf({
      project: project({
        history: [
          session({ weekStart: "2026-09-07", returned: false }),
          session({ weekStart: "2026-09-14", returned: true }),
        ],
      }),
      childId: "c1",
    });

    expect(log).toHaveLength(1);
    expect(log[0].status).toBe("returned");
    expect(log[0].returnedFriday).toBe("2026-09-18");
  });

  it("keeps a book that is still out at the top, however old its loan", () => {
    const log = loanLogOf({
      project: project({
        history: [session({ weekStart: "2026-09-07", returned: false })],
        currentAssignments: [elmerLoan],
      }),
      childId: "c1",
    });

    expect(log).toEqual([
      { book: elmer, since: "2026-09-04", status: "reading" },
    ]);
  });

  it("orders newest first and marks a loan that ended without a return", () => {
    const monstruoLoan = {
      childId: "c1",
      bookId: "b2",
      weekStart: "2026-09-14",
      since: "2026-09-18",
    };
    const log = loanLogOf({
      project: project({
        history: [
          session({ weekStart: "2026-09-07", returned: false }),
          {
            weekStart: "2026-09-21",
            returnedChildIds: ["c1"],
            missedChildIds: [],
            assignments: [monstruoLoan],
          },
        ],
      }),
      childId: "c1",
    });

    expect(log.map((record) => record.book?.title)).toEqual([
      "El monstruo de colores",
      "Elmer",
    ]);
    expect(log[1].status).toBe("unreturned");
  });

  it("keeps the line when the book has since left the library", () => {
    const log = loanLogOf({
      project: project({
        books: [],
        history: [session({ weekStart: "2026-09-07", returned: true })],
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
