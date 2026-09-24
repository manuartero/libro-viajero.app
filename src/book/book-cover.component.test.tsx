import { fireEvent, render, screen } from "@testing-library/react";
import { BookCover } from "src/book/book-cover.component";
import { describe, expect, it } from "vitest";

describe("<BookCover />", () => {
  it("falls back to the placeholder when the image fails to load", () => {
    render(
      <BookCover
        book={{ title: "Elmer", coverUrl: "https://covers.example/1-M.jpg" }}
      />,
    );

    fireEvent.error(screen.getByRole("presentation"));

    expect(screen.queryByRole("presentation")).toBeNull();
    expect(screen.getByText("E")).toBeDefined();
  });

  it("renders the placeholder immediately without a cover URL", () => {
    render(<BookCover book={{ title: "la oruga" }} />);

    expect(screen.queryByRole("presentation")).toBeNull();
    expect(screen.getByText("L")).toBeDefined();
  });
});
