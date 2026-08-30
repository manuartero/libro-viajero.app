import type { AppData } from "src/project/project.model";
import { getAppData, saveAppData } from "src/services/storage.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("libro-viajero:g-123", "{not json");

    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });
    errorLog.mockRestore();
  });

  it("backs up an unreadable entry before abandoning it", () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("libro-viajero:g-123", JSON.stringify({ foo: 1 }));

    expect(getAppData("g-123")).toEqual({
      projects: [],
      activeProjectId: null,
    });

    const backupKey = Object.keys(localStorage).find((key) =>
      key.startsWith("libro-viajero:g-123:backup-"),
    );
    expect(backupKey).toBeDefined();
    expect(localStorage.getItem(backupKey ?? "")).toBe(
      JSON.stringify({ foo: 1 }),
    );
    errorLog.mockRestore();
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

describe("saveAppData()", () => {
  it("reports failure instead of throwing when the write fails", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = saveAppData({
      googleId: "g-123",
      data: { projects: [], activeProjectId: null },
    });

    expect(result).toBe(false);
    setItem.mockRestore();
    errorLog.mockRestore();
  });
});
