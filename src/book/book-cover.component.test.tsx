import { fireEvent, render } from "@testing-library/react";
import { BookCover } from "src/book/book-cover.component";
import { describe, expect, it } from "vitest";

describe("<BookCover />", () => {
  it("renders the cover image when a URL is given", () => {
    const { container } = render(
      <BookCover title="Elmer" coverUrl="https://covers.example/1-M.jpg" />,
    );

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("https://covers.example/1-M.jpg");
  });

  it("falls back to the placeholder when the image fails to load", () => {
    const { container } = render(
      <BookCover title="Elmer" coverUrl="https://covers.example/1-M.jpg" />,
    );

    const img = container.querySelector("img");
    if (!img) {
      throw new Error("expected an <img>");
    }
    fireEvent.error(img);

    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe("E");
  });

  it("renders the placeholder immediately without a cover URL", () => {
    const { container } = render(<BookCover title="la oruga" />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe("L");
  });
});
