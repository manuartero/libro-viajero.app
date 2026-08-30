import { fireEvent, render, screen } from "@testing-library/react";
import { Roster } from "src/setup/roster.component";
import { describe, expect, it, vi } from "vitest";

const childList = [
  { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" },
  { id: "c2", tag: "Dino", emoji: "🦕", color: "#ffca3a" },
];

describe("<Roster />", () => {
  it("invites the teacher when the class is still empty", () => {
    render(<Roster childList={[]} editingId={null} onSelect={() => {}} />);

    expect(screen.getByText("Aquí irán apareciendo tus peques")).toBeDefined();
  });

  it("lists every child as an editable chip", () => {
    render(
      <Roster childList={childList} editingId={null} onSelect={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "Rana, editar" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Dino, editar" })).toBeDefined();
  });

  it("reports the tapped child", () => {
    const onSelect = vi.fn();
    render(
      <Roster childList={childList} editingId={null} onSelect={onSelect} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dino, editar" }));

    expect(onSelect).toHaveBeenCalledWith("c2");
  });
});
