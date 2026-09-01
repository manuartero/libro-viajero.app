import { fireEvent, render, screen } from "@testing-library/react";
import { Bookshelf } from "src/library/bookshelf.component";
import { describe, expect, it, vi } from "vitest";

describe("<Bookshelf />", () => {
  it("shows an empty message without books", () => {
    render(<Bookshelf bookList={[]} onRemove={() => {}} />);

    expect(screen.getByText("Aquí irán apareciendo los libros")).toBeDefined();
  });

  it("lists books and removes one on tap", () => {
    const onRemove = vi.fn();
    render(
      <Bookshelf
        bookList={[
          { id: "b1", title: "Elmer", author: "David McKee" },
          { id: "b2", title: "Elmer" },
        ]}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("David McKee")).toBeDefined();
    // Duplicate titles are legit (two physical copies) — both rows render.
    expect(
      screen.getAllByRole("button", { name: "Elmer, quitar" }),
    ).toHaveLength(2);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Elmer, quitar" })[1],
    );

    expect(onRemove).toHaveBeenCalledWith("b2");
  });
});
