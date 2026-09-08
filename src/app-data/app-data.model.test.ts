import { parseAppData } from "src/app-data/app-data.model";
import { describe, expect, it } from "vitest";

const project = {
  id: "p1",
  name: "Clase Caracoles 2026/27",
  children: [{ id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" }],
  books: [{ id: "b1", title: "Elmer" }],
  currentAssignments: [
    { childId: "c1", bookId: "b1", weekStart: "2026-09-07" },
  ],
  history: [],
};

const parse = (value: unknown) => parseAppData(JSON.stringify(value));

describe("parseAppData()", () => {
  it("accepts a whole export and hands it back typed", () => {
    const data = { projects: [project], activeProjectId: "p1" };

    expect(parse(data)).toEqual(data);
  });

  it("accepts a fresh install with no active project", () => {
    expect(parse({ projects: [], activeProjectId: null })).toEqual({
      projects: [],
      activeProjectId: null,
    });
  });

  it("rejects broken JSON and anything that is not an object with a projects list", () => {
    expect(parseAppData("{not json")).toBeNull();
    expect(parse("libro-viajero")).toBeNull();
    expect(parse({ activeProjectId: "p1" })).toBeNull();
  });

  it("rejects a project that a screen could not render", () => {
    const { history: _history, ...noHistory } = project;

    expect(parse({ projects: [noHistory], activeProjectId: "p1" })).toBeNull();
  });

  it("rejects a child or a book missing what the cards show", () => {
    const nameless = { ...project, children: [{ id: "c1", emoji: "🐸" }] };
    const untitled = { ...project, books: [{ id: "b1" }] };

    expect(parse({ projects: [nameless], activeProjectId: "p1" })).toBeNull();
    expect(parse({ projects: [untitled], activeProjectId: "p1" })).toBeNull();
  });
});
