import { fireEvent, render, screen } from "@testing-library/react";
import { ChildCard } from "src/dashboard/child-card.component";
import { describe, expect, it, vi } from "vitest";

const child = { id: "c1", tag: "Verde", emoji: "🐸", color: "#8ac926" };
const book = { id: "b1", title: "La oruga glotona" };

describe("<ChildCard />", () => {
  it("exposes the child and their book as the accessible name", () => {
    render(
      <ChildCard
        child={child}
        book={book}
        returned={false}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Verde — La oruga glotona" }),
    ).toBeDefined();
  });

  it("reports the return toggle for the tapped child", () => {
    const onToggle = vi.fn();
    render(
      <ChildCard
        child={child}
        book={book}
        returned={false}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Verde/ }));

    expect(onToggle).toHaveBeenCalledWith("c1");
  });

  it("marks the returned state as pressed", () => {
    render(
      <ChildCard
        child={child}
        book={book}
        returned={true}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Verde/, pressed: true }),
    ).toBeDefined();
  });
});
