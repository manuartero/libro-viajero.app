import { fireEvent, render, screen } from "@testing-library/react";
import { Roster } from "src/setup/roster.component";
import { describe, expect, it, vi } from "vitest";
import { childList } from "./wizard.fixture";

describe("<Roster />", () => {
  it("invites the teacher when the class is still empty", () => {
    render(<Roster childList={[]} editingId={null} onSelect={() => {}} />);

    expect(screen.getByText("Aquí irán apareciendo tus peques")).toBeDefined();
  });

  it("reports the tapped child from the editable chips", () => {
    const onSelect = vi.fn();
    render(
      <Roster childList={childList} editingId={null} onSelect={onSelect} />,
    );

    expect(screen.getByRole("button", { name: "Rana, editar" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Dino, editar" }));

    expect(onSelect).toHaveBeenCalledWith("c2");
  });
});
