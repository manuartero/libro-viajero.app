import type { AppData } from "src/project/project.model";
import { getAppData, saveAppData } from "src/services/storage.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

const sampleData: AppData = {
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

describe("getAppData()", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the empty app data when nothing is stored", () => {
    expect(getAppData()).toEqual({
      projects: [],
      activeProjectId: null,
    });
  });

  it("returns the empty app data when the stored entry is corrupted", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("libro-viajero", "{not json");

    expect(getAppData()).toEqual({
      projects: [],
      activeProjectId: null,
    });
    errorLog.mockRestore();
  });

  it("backs up an unreadable entry before abandoning it", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("libro-viajero", JSON.stringify({ foo: 1 }));

    expect(getAppData()).toEqual({
      projects: [],
      activeProjectId: null,
    });

    const backupKey = Object.keys(localStorage).find((key) =>
      key.startsWith("libro-viajero:backup-"),
    );
    expect(backupKey).toBeDefined();
    expect(localStorage.getItem(backupKey ?? "")).toBe(
      JSON.stringify({ foo: 1 }),
    );
    errorLog.mockRestore();
  });

  it("round-trips what saveAppData() stored", () => {
    saveAppData(sampleData);

    expect(getAppData()).toEqual(sampleData);
  });

  it("migrates data saved under the pre-login key", () => {
    localStorage.setItem("libro-viajero:anonymous", JSON.stringify(sampleData));

    expect(getAppData()).toEqual(sampleData);
    expect(localStorage.getItem("libro-viajero")).toBe(
      JSON.stringify(sampleData),
    );
  });

  it("prefers the current key over a stale pre-login copy", () => {
    const stale: AppData = { projects: [], activeProjectId: null };
    localStorage.setItem("libro-viajero:anonymous", JSON.stringify(stale));
    localStorage.setItem("libro-viajero", JSON.stringify(sampleData));

    expect(getAppData()).toEqual(sampleData);
    expect(localStorage.getItem("libro-viajero")).toBe(
      JSON.stringify(sampleData),
    );
  });

  it("still returns the pre-login data when the migration write fails", () => {
    localStorage.setItem("libro-viajero:anonymous", JSON.stringify(sampleData));
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(getAppData()).toEqual(sampleData);

    setItem.mockRestore();
    errorLog.mockRestore();
  });
});

describe("saveAppData()", () => {
  it("reports failure instead of throwing when the write fails", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = saveAppData({ projects: [], activeProjectId: null });

    expect(result).toBe(false);
    setItem.mockRestore();
    errorLog.mockRestore();
  });
});
