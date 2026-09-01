import { fireEvent, render, screen } from "@testing-library/react";
import { BookSearch } from "src/setup/book-search.component";
import { afterEach, describe, expect, it, vi } from "vitest";

const okResponse = (docs: unknown[]) =>
  ({ ok: true, json: async () => ({ docs }) }) as Response;

const submitSearch = (query: string) => {
  fireEvent.change(screen.getByLabelText("Busca un libro por título"), {
    target: { value: query },
  });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
};

describe("<BookSearch />", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cannot search with a blank query", () => {
    render(<BookSearch onAdd={() => {}} />);

    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Buscar" })
        .disabled,
    ).toBe(true);
  });

  it("searches on submit and adds a tapped result", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          okResponse([
            { title: "Elmer", author_name: ["David McKee"], cover_i: 42 },
          ]),
        ),
    );
    const onAdd = vi.fn();
    render(<BookSearch onAdd={onAdd} />);

    submitSearch("elmer");

    fireEvent.click(
      await screen.findByRole("button", { name: "Elmer, David McKee" }),
    );

    expect(onAdd).toHaveBeenCalledWith({
      title: "Elmer",
      author: "David McKee",
      coverUrl: "https://covers.openlibrary.org/b/id/42-M.jpg?default=false",
      isbn: undefined,
    });
  });

  it("offers manual entry when nothing is found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse([])));
    const onAdd = vi.fn();
    render(<BookSearch onAdd={onAdd} />);

    submitSearch("libro rarísimo");

    expect(
      await screen.findByText("No hemos encontrado «libro rarísimo»"),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Añadirlo a mano" }));

    // The manual title is prefilled with the failed query.
    expect(screen.getByLabelText<HTMLInputElement>("Título").value).toBe(
      "libro rarísimo",
    );
    fireEvent.change(screen.getByLabelText("Autor (opcional)"), {
      target: { value: "  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Añadir libro" }));

    expect(onAdd).toHaveBeenCalledWith({
      title: "libro rarísimo",
      author: undefined,
    });
  });

  it("shows an alert with retry and manual fallback when the search fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    render(<BookSearch onAdd={() => {}} />);

    submitSearch("elmer");

    expect(await screen.findByRole("alert")).toBeDefined();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Añadirlo a mano" }),
    ).toBeDefined();
  });

  it("adds a manual book without searching", () => {
    const onAdd = vi.fn();
    render(<BookSearch onAdd={onAdd} />);

    fireEvent.click(
      screen.getByRole("button", { name: "¿No lo encuentras? Añádelo a mano" }),
    );
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "  El libro de la abuela  " },
    });
    fireEvent.change(screen.getByLabelText("Autor (opcional)"), {
      target: { value: "Abuela" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Añadir libro" }));

    expect(onAdd).toHaveBeenCalledWith({
      title: "El libro de la abuela",
      author: "Abuela",
    });
  });
});
