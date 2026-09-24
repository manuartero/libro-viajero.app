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

const draft = (initialPairs: Record<string, string> = {}) =>
  renderHook(() => useAssignmentDraft({ children, books, initialPairs }));

describe("useAssignmentDraft()", () => {
  it("starts from the pairs it is given", () => {
    const { result } = draft({ c2: "b2" });

    expect(result.current.pairs).toEqual({ c2: "b2" });
    expect(result.current.assignedCount).toBe(1);
    expect(result.current.trayBooks.map((book) => book.id)).toEqual(["b1"]);
  });

  it("keeps one book with one child, taking it off whoever had it", () => {
    const { result } = draft();

    act(() => result.current.assignToActive("b1"));
    act(() => result.current.toggleSelected("c2"));
    act(() => result.current.assignToActive("b1"));

    expect(result.current.pairs).toEqual({ c2: "b1" });
    expect(result.current.assignedCount).toBe(1);
  });

  it("lets a second tap on the same child undo the choice", () => {
    const { result } = draft();

    act(() => result.current.toggleSelected("c2"));
    act(() => result.current.toggleSelected("c2"));

    expect(result.current.activeChildId).toBe("c1");
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
