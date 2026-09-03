import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmPanel } from "./confirm-panel.component";

// The panel is always opened from a trigger that sits elsewhere on the page,
// so the focus contract only means anything when it is exercised that way.
function Harness({
  onConfirm,
}: {
  onConfirm: () => void;
  // Changing this re-renders the panel's parent without touching focus.
  nonce?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Quitar
      </button>

      {open && (
        <ConfirmPanel
          label="Quitar a Rana"
          confirmText="Sí, quitarlo"
          cancelText="No, mantenerlo"
          onConfirm={onConfirm}
          onCancel={() => setOpen(false)}
        >
          «Rana» tiene un libro en casa.
        </ConfirmPanel>
      )}
    </>
  );
}

const openPanel = () => {
  const trigger = screen.getByRole("button", { name: "Quitar" });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
};

describe("<ConfirmPanel />", () => {
  it("announces the consequence as its description", () => {
    render(<Harness onConfirm={vi.fn()} />);
    openPanel();

    expect(
      screen.getByRole("alertdialog", {
        name: "Quitar a Rana",
        description: "«Rana» tiene un libro en casa.",
      }),
    ).toBeDefined();
  });

  it("moves focus into the panel when it opens", () => {
    render(<Harness onConfirm={vi.fn()} />);
    openPanel();

    expect(document.activeElement).toBe(screen.getByRole("alertdialog"));
  });

  it("cancels on Escape", () => {
    render(<Harness onConfirm={vi.fn()} />);
    openPanel();

    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("returns focus to the trigger when it closes", () => {
    render(<Harness onConfirm={vi.fn()} />);
    const trigger = openPanel();

    fireEvent.click(screen.getByRole("button", { name: "No, mantenerlo" }));

    expect(document.activeElement).toBe(trigger);
  });

  // The screens that host the panel re-render while it is open (ClassroomScreen
  // does on editingId, confirmingRemove and project), so the focus contract has
  // to survive that and not just the open and close.
  it("leaves focus where the teacher put it across a re-render", () => {
    const { rerender } = render(<Harness onConfirm={vi.fn()} nonce={0} />);
    openPanel();
    const confirm = screen.getByRole("button", { name: "Sí, quitarlo" });
    confirm.focus();

    rerender(<Harness onConfirm={vi.fn()} nonce={1} />);

    expect(document.activeElement).toBe(confirm);
  });

  it("confirms without closing itself, so a failed save stays retryable", () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    openPanel();

    fireEvent.click(screen.getByRole("button", { name: "Sí, quitarlo" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole("alertdialog")).toBeDefined();
  });
});
