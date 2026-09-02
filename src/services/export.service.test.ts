import type { AppData } from "src/project/project.model";
import { buildExport } from "src/services/export.service";
import { describe, expect, it } from "vitest";

describe("buildExport()", () => {
  const data: AppData = {
    projects: [
      {
        id: "p1",
        name: "Clase Caracoles 2026/27",
        children: [{ id: "c1", tag: "Rana", emoji: "🐸", color: "#2ecc71" }],
        books: [{ id: "b1", title: "Elmer" }],
        currentAssignments: [
          { childId: "c1", bookId: "b1", weekStart: "2026-09-07" },
        ],
        history: [],
      },
    ],
    activeProjectId: "p1",
  };

  it("names the file after the app and the day", () => {
    const { filename } = buildExport({
      data,
      today: new Date("2026-09-04T15:00:00Z"),
    });

    expect(filename).toBe("libro-viajero-2026-09-04.json");
  });

  it("serializes every project so the file restores the whole app", () => {
    const { content } = buildExport({ data, today: new Date() });

    expect(JSON.parse(content)).toEqual(data);
  });
});
