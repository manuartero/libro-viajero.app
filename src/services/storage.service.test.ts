import type { AppData } from "src/project/project.model";
import { getAppData, saveAppData } from "src/services/storage.service";
import { beforeEach, describe, expect, it } from "vitest";

describe("getAppData()", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the empty app data when nothing is stored", () => {
    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });
  });

  it("returns the empty app data when the stored entry is corrupted", () => {
    localStorage.setItem("libro-viajero:g-123", "{not json");

    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });
  });

  it("keeps each user's data in its own namespace", () => {
    const data: AppData = {
      projects: [
        {
          id: "p1",
          name: "Clase Caracoles 2026/27",
          children: [],
          books: [],
          currentAssignments: [],
          history: [],
        },
      ],
      activeProjectId: "p1",
    };

    saveAppData({ googleId: "g-123", data });

    expect(getAppData("g-123")).toEqual(data);
    expect(getAppData("g-456")).toEqual({
      projects: [],
      activeProjectId: null,
    });
  });
});
