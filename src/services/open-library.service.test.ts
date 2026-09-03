import { afterEach, describe, expect, it, vi } from "vitest";
import { searchBooks } from "./open-library.service";

const okResponse = (docs: unknown[]) =>
  ({ ok: true, json: async () => ({ docs }) }) as Response;

describe("searchBooks()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the search endpoint with the encoded title", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await searchBooks({ title: "la oruga glotona" });

    const url: string = fetchMock.mock.calls[0][0];
    expect(url).toBe(
      "https://openlibrary.org/search.json?title=la%20oruga%20glotona&limit=8&fields=title,author_name,cover_i,isbn",
    );
  });

  it("maps a full doc to a BookDraft with a 404-able cover URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okResponse([
          {
            title: "The Very Hungry Caterpillar",
            author_name: ["Eric Carle", "Otra Persona"],
            cover_i: 8739161,
            isbn: ["0399208534", "9780399208539"],
          },
        ]),
      ),
    );

    const drafts = await searchBooks({ title: "caterpillar" });

    expect(drafts).toEqual([
      {
        title: "The Very Hungry Caterpillar",
        author: "Eric Carle",
        coverUrl:
          "https://covers.openlibrary.org/b/id/8739161-M.jpg?default=false",
        isbn: "0399208534",
      },
    ]);
  });

  it("leaves optional fields undefined and skips docs without title", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(okResponse([{ title: "Elmer" }, { cover_i: 1 }])),
    );

    const drafts = await searchBooks({ title: "elmer" });

    expect(drafts).toEqual([
      {
        title: "Elmer",
        author: undefined,
        coverUrl: undefined,
        isbn: undefined,
      },
    ]);
  });

  it("returns an empty list when the search finds nothing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse([])));

    expect(await searchBooks({ title: "zzzz" })).toEqual([]);
  });

  it("throws on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 } as Response),
    );

    await expect(searchBooks({ title: "elmer" })).rejects.toThrow("503");
  });

  it("forwards the caller's abort signal", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse([]));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await searchBooks({ title: "elmer", signal: controller.signal });

    const init: RequestInit = fetchMock.mock.calls[0][1];
    expect(init.signal).toBeInstanceOf(AbortSignal);
    controller.abort();
    expect(init.signal?.aborted).toBe(true);
  });
});
