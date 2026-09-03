import type { AppData } from "src/project/project.model";
import { downloadAppData } from "src/services/export.service";
import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("downloadAppData()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("hands the browser a JSON file named after the day", async () => {
    vi.useFakeTimers();
    // Half past midnight local time: the UTC date would still be the 3rd.
    vi.setSystemTime(new Date(2026, 8, 4, 0, 30));
    const createObjectURL = vi.fn((_blob: Blob) => "blob:libro-viajero");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    downloadAppData(data);

    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("libro-viajero-2026-09-04.json");
    expect(anchor.href).toBe("blob:libro-viajero");
    expect(anchor.isConnected).toBe(false);
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(JSON.parse((await blob?.text()) ?? "")).toEqual(data);

    // The URL must outlive the click; it is released on the next tick.
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:libro-viajero");
  });
});
