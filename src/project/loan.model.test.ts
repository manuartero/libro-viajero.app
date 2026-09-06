import {
  type ChildLoan,
  daysAtHomeLabel,
  fridayLabel,
  loanOf,
  loanWeeksOf,
  returnFridayFor,
  upcomingFridays,
} from "src/project/loan.model";
import { describe, expect, it } from "vitest";

// Week of Mon 31 Aug 2026; the following Friday is 11 Sep.
const assignment = { childId: "c1", bookId: "b1", weekStart: "2026-08-31" };

describe("loanWeeksOf()", () => {
  it("defaults a project saved before the setting existed to one week", () => {
    expect(loanWeeksOf({})).toBe(1);
    expect(loanWeeksOf({ loanWeeks: 2 })).toBe(2);
  });
});

describe("loanOf()", () => {
  it("is due the week after a one-week loan started", () => {
    const loan = loanOf({
      assignment,
      loanWeeks: 1,
      today: new Date(2026, 8, 11), // Fri 11 Sep
    });

    expect(loan.status).toBe("due");
    expect(loan.dueFriday).toBe("2026-09-11");
  });

  it("is still reading during the week it started, and any earlier week", () => {
    const loan = loanOf({
      assignment,
      loanWeeks: 1,
      today: new Date(2026, 8, 4), // Fri 4 Sep, the reparto day
    });

    expect(loan.status).toBe("reading");
  });

  it("is overdue once the due week is over", () => {
    const loan = loanOf({
      assignment,
      loanWeeks: 1,
      today: new Date(2026, 8, 14), // Mon 14 Sep
    });

    expect(loan.status).toBe("overdue");
  });

  it("pushes the due Friday out with a two-week loan", () => {
    const loan = loanOf({
      assignment,
      loanWeeks: 2,
      today: new Date(2026, 8, 11),
    });

    expect(loan.status).toBe("reading");
    expect(loan.dueFriday).toBe("2026-09-18");
  });

  it("counts days at home from the day the book went out", () => {
    const loan = loanOf({
      assignment: { ...assignment, since: "2026-09-04" },
      loanWeeks: 1,
      today: new Date(2026, 8, 8), // Tue 8 Sep
    });

    expect(loan.daysAtHome).toBe(4);
  });

  it("falls back to the week's Monday when the day out is unknown", () => {
    const loan = loanOf({
      assignment,
      loanWeeks: 1,
      today: new Date(2026, 8, 8),
    });

    expect(loan.daysAtHome).toBe(8);
  });

  it("never reports negative days when the clock went backwards", () => {
    const loan = loanOf({
      assignment: { ...assignment, since: "2026-09-10" },
      loanWeeks: 1,
      today: new Date(2026, 8, 8),
    });

    expect(loan.daysAtHome).toBe(0);
  });
});

describe("returnFridayFor()", () => {
  it("names the Friday a book handed out today comes back", () => {
    const today = new Date(2026, 8, 4); // Fri 4 Sep

    expect(returnFridayFor({ loanWeeks: 1, today })).toBe("2026-09-11");
    expect(returnFridayFor({ loanWeeks: 2, today })).toBe("2026-09-18");
  });
});

describe("upcomingFridays()", () => {
  const child = { id: "c", tag: "x", emoji: "🐸", color: "#000" };
  const book = { id: "b", title: "y" };
  const reading = (dueFriday: string): ChildLoan => ({
    child,
    book,
    loan: { status: "reading", dueFriday, daysAtHome: 1 },
  });

  it("counts children per due Friday, soonest first", () => {
    expect(
      upcomingFridays([
        reading("2026-09-25"),
        reading("2026-09-18"),
        reading("2026-09-25"),
      ]),
    ).toEqual([
      { dueFriday: "2026-09-18", count: 1 },
      { dueFriday: "2026-09-25", count: 2 },
    ]);
  });
});

describe("daysAtHomeLabel()", () => {
  it("reads naturally at zero, one and many", () => {
    expect(daysAtHomeLabel(0)).toBe("desde hoy");
    expect(daysAtHomeLabel(1)).toBe("1 día en casa");
    expect(daysAtHomeLabel(4)).toBe("4 días en casa");
  });
});

describe("fridayLabel()", () => {
  it("spells the date out in Spanish without the formatter's comma", () => {
    expect(fridayLabel("2026-09-18")).toBe("viernes 18 de septiembre");
  });
});
