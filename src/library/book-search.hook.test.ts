import { act, renderHook } from "@testing-library/react";
import { useBookSearch } from "src/library/book-search.hook";
import { afterEach, describe, expect, it, vi } from "vitest";

const okResponse = (docs: unknown[]) =>
  ({ ok: true, json: async () => ({ docs }) }) as Response;

const stubFetch = (response: Response | Error) => {
  const fetchMock =
    response instanceof Error
      ? vi.fn().mockRejectedValue(response)
      : vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const runSearch = async (query: string) => {
  const { result } = renderHook(() => useBookSearch());
  await act(async () => {
    await result.current.runSearch(query);
  });
  return result;
};

describe("useBookSearch()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts idle", () => {
    const { result } = renderHook(() => useBookSearch());

    expect(result.current.search).toEqual({ status: "idle" });
  });

  it("reports the found books, each under its own key", async () => {
    stubFetch(
      okResponse([
        { title: "Elmer", author_name: ["David McKee"] },
        { title: "Elmer" },
      ]),
    );

    const result = await runSearch("Elmer");

    expect(result.current.search).toEqual({
      status: "results",
      results: [
        {
          key: expect.any(String),
          draft: { title: "Elmer", author: "David McKee" },
        },
        { key: expect.any(String), draft: { title: "Elmer" } },
      ],
    });
    // Duplicate titles are legitimate, so the keys must still differ.
    const { results } = result.current.search as { results: { key: string }[] };
    expect(new Set(results.map(({ key }) => key)).size).toBe(2);
  });

  it("reports the trimmed query back when nothing matches", async () => {
    stubFetch(okResponse([]));

    const result = await runSearch("  Libro que no existe  ");

    expect(result.current.search).toEqual({
      status: "empty",
      query: "Libro que no existe",
    });
  });

  it("reports an error when the search fails", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(new Error("offline"));

    const result = await runSearch("Elmer");

    expect(result.current.search).toEqual({ status: "error" });
    errorLog.mockRestore();
  });

  it("does not search on a blank query", async () => {
    const fetchMock = stubFetch(okResponse([]));

    const result = await runSearch("   ");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.search).toEqual({ status: "idle" });
  });
});
