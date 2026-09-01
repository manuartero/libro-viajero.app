import { fireEvent, render, screen } from "@testing-library/react";
import { BookCover } from "src/book/book-cover.component";
import { describe, expect, it } from "vitest";

// BookCover is deliberately decorative (alt="", aria-hidden) — its accessible
// name is the visible title next to it — so role/name queries cannot reach it.
// testId is the documented last resort; only the fallback logic is worth a test.
describe("<BookCover />", () => {
  it("falls back to the placeholder when the image fails to load", () => {
    render(
      <BookCover title="Elmer" coverUrl="https://covers.example/1-M.jpg" />,
    );

    fireEvent.error(screen.getByTestId("book-cover-image"));

    expect(screen.queryByTestId("book-cover-image")).toBeNull();
    expect(screen.getByTestId("book-cover-placeholder").textContent).toBe("E");
  });
});
