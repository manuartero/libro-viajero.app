import { fireEvent, render, screen } from "@testing-library/react";
import { ChildCard } from "src/dashboard/child-card.component";
import type { Loan } from "src/project/loan.model";
import { describe, expect, it, vi } from "vitest";

const child = { id: "c1", tag: "Verde", emoji: "🐸", color: "#8ac926" };
const book = { id: "b1", title: "La oruga glotona" };
const loan: Loan = { status: "due", dueFriday: "2026-09-11", daysAtHome: 4 };

describe("<ChildCard />", () => {
  it("names the card by child and book, and describes it by time at home", () => {
    render(
      <ChildCard
        child={child}
        book={book}
        loan={loan}
        returned={false}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Verde — La oruga glotona",
        description: "4 días en casa",
      }),
    ).toBeDefined();
  });

  it("reports the return toggle for the tapped child", () => {
    const onToggle = vi.fn();
    render(
      <ChildCard
        child={child}
        book={book}
        loan={loan}
        returned={false}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Verde/ }));

    expect(onToggle).toHaveBeenCalledWith("c1");
  });

  it("marks the returned state via aria-pressed and says so", () => {
    render(
      <ChildCard
        child={child}
        book={book}
        loan={loan}
        returned={true}
        onToggle={() => {}}
      />,
    );

    const card = screen.getByRole("button", {
      name: /Verde/,
      description: "devuelto",
    });
    expect(card.getAttribute("aria-pressed")).toBe("true");
  });
});
