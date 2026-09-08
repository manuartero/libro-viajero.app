import type { AppData } from "src/app-data/app-data.model";
import {
  backupDateline,
  backupDateOf,
  backupSummary,
  parseBackup,
} from "src/backup/backup.model";
import type { Project } from "src/project/project.model";
import { describe, expect, it } from "vitest";

const project = (id: string, name: string): Project => ({
  id,
  name,
  children: [
    { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" },
    { id: "c2", tag: "Zorro", emoji: "🦊", color: "#f3722c" },
  ],
  books: [{ id: "b1", title: "Elmer" }],
  currentAssignments: [
    { childId: "c1", bookId: "b1", weekStart: "2026-09-07" },
  ],
  history: [],
});

const fileOf = (appData: unknown) => ({
  text: JSON.stringify(appData),
  filename: "libro-viajero-2026-06-20.json",
  lastModified: new Date(2026, 8, 1).getTime(),
});

describe("backupDateOf()", () => {
  it("reads the day off the exported filename", () => {
    expect(
      backupDateOf({
        filename: "libro-viajero-2026-06-20.json",
        lastModified: new Date(2026, 8, 1).getTime(),
      }),
    ).toBe("2026-06-20");
  });

  it("survives the suffix a second download gets", () => {
    expect(
      backupDateOf({
        filename: "libro-viajero-2026-06-20 (1).json",
        lastModified: new Date(2026, 8, 1).getTime(),
      }),
    ).toBe("2026-06-20");
  });

  it("falls back to the file's own date once the name has lost it", () => {
    expect(
      backupDateOf({
        filename: "copia clase.json",
        lastModified: new Date(2026, 8, 1, 9, 30).getTime(),
      }),
    ).toBe("2026-09-01");
  });
});

describe("parseBackup()", () => {
  it("returns the class the copy was working on", () => {
    const appData: AppData = {
      projects: [project("p1", "Antigua 2024/25"), project("p2", "Caracoles")],
      activeProjectId: "p2",
    };

    const backup = parseBackup(fileOf(appData));

    expect(backup?.project.name).toBe("Caracoles");
    expect(backup?.appData).toEqual(appData);
    expect(backup?.savedOn).toBe("2026-06-20");
  });

  it("heals a copy whose active class is missing to its first class", () => {
    const backup = parseBackup(
      fileOf({ projects: [project("p1", "Caracoles")], activeProjectId: "x" }),
    );

    expect(backup?.project.id).toBe("p1");
    expect(backup?.appData.activeProjectId).toBe("p1");
  });

  it("treats broken JSON, the wrong shape and an empty app alike: nothing to restore", () => {
    expect(parseBackup({ ...fileOf(null), text: "{not json" })).toBeNull();
    expect(parseBackup(fileOf({ wrong: "shape" }))).toBeNull();
    expect(
      parseBackup(fileOf({ projects: [], activeProjectId: null })),
    ).toBeNull();
  });
});

describe("backupDateline() and backupSummary()", () => {
  it("describe the copy the way the masthead would", () => {
    const backup = parseBackup(
      fileOf({ projects: [project("p1", "Caracoles")], activeProjectId: "p1" }),
    );

    expect(backup && backupDateline(backup)).toBe(
      "Copia del 20 de junio de 2026",
    );
    expect(backup && backupSummary(backup.project)).toBe(
      "2 peques · 1 libro · 1 en casa",
    );
  });

  it("leaves the loans out of the summary when every book is back", () => {
    const backup = parseBackup(
      fileOf({
        projects: [{ ...project("p1", "Caracoles"), currentAssignments: [] }],
        activeProjectId: "p1",
      }),
    );

    expect(backup && backupSummary(backup.project)).toBe("2 peques · 1 libro");
  });
});
