import { act, renderHook } from "@testing-library/react";
import { useAssignmentDraft } from "src/assign/assignment-draft.hook";
import { describe, expect, it } from "vitest";

const children = [
  { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" },
  { id: "c2", tag: "Zorro", emoji: "🦊", color: "#1982c4" },
];

const books = [
  { id: "b1", title: "Elmer" },
  { id: "b2", title: "El Grúfalo" },
];

const draft = (
  currentAssignments: Parameters<
    typeof useAssignmentDraft
  >[0]["currentAssignments"] = [],
) =>
  renderHook(() => useAssignmentDraft({ children, books, currentAssignments }));

describe("useAssignmentDraft()", () => {
  it("starts from the assignments already in the project", () => {
    const { result } = draft([
      { childId: "c2", bookId: "b2", weekStart: "2026-09-07" },
    ]);

    expect(result.current.pairs).toEqual({ c2: "b2" });
    expect(result.current.assignedCount).toBe(1);
    // b2 is taken, so only b1 is left to hand out.
    expect(result.current.trayBooks.map((book) => book.id)).toEqual(["b1"]);
  });

  it("serves the first child without a book when none is selected", () => {
    const { result } = draft();

    expect(result.current.activeChildId).toBe("c1");
  });

  it("advances to the next child without a book after each assignment", () => {
    const { result } = draft();

    act(() => result.current.assignToActive("b1"));

    expect(result.current.pairs).toEqual({ c1: "b1" });
    expect(result.current.activeChildId).toBe("c2");
  });

  it("keeps one book with one child, taking it off whoever had it", () => {
    const { result } = draft();

    act(() => result.current.assignToActive("b1"));
    act(() => result.current.toggleSelected("c2"));
    act(() => result.current.assignToActive("b1"));

    expect(result.current.pairs).toEqual({ c2: "b1" });
    expect(result.current.assignedCount).toBe(1);
  });

  it("serves a child the teacher picks instead of the next one", () => {
    const { result } = draft();

    act(() => result.current.toggleSelected("c2"));
    expect(result.current.activeChildId).toBe("c2");

    act(() => result.current.assignToActive("b1"));
    expect(result.current.pairs).toEqual({ c2: "b1" });
  });

  it("lets a second tap on the same child undo the choice", () => {
    const { result } = draft();

    act(() => result.current.toggleSelected("c2"));
    act(() => result.current.toggleSelected("c2"));

    expect(result.current.activeChildId).toBe("c1");
  });

  it("puts an unassigned book back on the tray", () => {
    const { result } = draft();

    act(() => result.current.assignToActive("b1"));
    act(() => result.current.unassign("c1"));

    expect(result.current.pairs).toEqual({});
    expect(result.current.trayBooks.map((book) => book.id)).toEqual([
      "b1",
      "b2",
    ]);
  });

  it("does nothing when every child already has a book", () => {
    const { result } = draft();

    act(() => result.current.assignToActive("b1"));
    act(() => result.current.assignToActive("b2"));
    expect(result.current.activeChildId).toBeNull();

    act(() => result.current.assignToActive("b1"));

    expect(result.current.pairs).toEqual({ c1: "b1", c2: "b2" });
  });
});
