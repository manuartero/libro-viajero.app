import { fireEvent, render, screen } from "@testing-library/react";
import { Bookshelf } from "src/library/bookshelf.component";
import { describe, expect, it, vi } from "vitest";

const noop = () => {};

describe("<Bookshelf />", () => {
  it("shows an empty message without books", () => {
    render(
      <Bookshelf
        bookList={[]}
        openBookId={null}
        onToggle={noop}
        onRemove={noop}
      />,
    );

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
        openBookId={null}
        onToggle={noop}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByText("David McKee")).toBeDefined();
    expect(
      screen.getAllByRole("button", { name: "Elmer, quitar" }),
    ).toHaveLength(2);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Elmer, quitar" })[1],
    );

    expect(onRemove).toHaveBeenCalledWith("b2");
  });

  it("marks the open book, shows its card once and toggles on tap", () => {
    const onToggle = vi.fn();
    render(
      <Bookshelf
        bookList={[
          { id: "b1", title: "Elmer" },
          { id: "b2", title: "El monstruo de colores" },
        ]}
        openBookId="b2"
        onToggle={onToggle}
        onRemove={noop}
      >
        <p>Sus viajes</p>
      </Bookshelf>,
    );

    expect(
      screen.getByRole("button", {
        name: "El monstruo de colores",
        expanded: true,
      }),
    ).toBeDefined();
    expect(screen.getAllByText("Sus viajes")).toHaveLength(1);

    fireEvent.click(
      screen.getByRole("button", { name: "Elmer", expanded: false }),
    );

    expect(onToggle).toHaveBeenCalledWith("b1");
  });
});
