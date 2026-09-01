import type { Project } from "src/project/project.model";
import {
  addBook,
  addChild,
  removeBook,
  removeChild,
  saveChild,
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
  history: [
    {
      weekStart: "2026-08-24",
      returnedChildIds: ["c1"],
      missedChildIds: ["c2"],
      assignments: [{ childId: "c1", bookId: "b2", weekStart: "2026-08-24" }],
    },
  ],
});

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

  it("leaves history untouched", () => {
    const project = baseProject();
    const next = removeChild({ project, childId: "c1" });
    expect(next.history).toBe(project.history);
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

describe("removeBook()", () => {
  it("removes the book and prunes its assignment", () => {
    const next = removeBook({ project: baseProject(), bookId: "b2" });
    expect(next.books.map((b) => b.id)).toEqual(["b1"]);
    expect(next.currentAssignments).toEqual([
      { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
    ]);
  });

  it("leaves history untouched", () => {
    const project = baseProject();
    const next = removeBook({ project, bookId: "b1" });
    expect(next.history).toBe(project.history);
  });
});
