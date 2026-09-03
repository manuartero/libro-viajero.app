import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmRemove } from "src/confirm-remove.component";
import { describe, expect, it, vi } from "vitest";

describe("<ConfirmRemove />", () => {
  it("takes focus on open so the panel scrolls into view", () => {
    render(
      <ConfirmRemove
        label="Quitar a Rana"
        onConfirm={() => {}}
        onCancel={() => {}}
      >
        «Rana» tiene un libro en casa.
      </ConfirmRemove>,
    );

    expect(document.activeElement).toBe(
      screen.getByRole("alertdialog", { name: "Quitar a Rana" }),
    );
  });

  it("reports the teacher's answer either way", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmRemove
        label="Quitar a Rana"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        «Rana» tiene un libro en casa.
      </ConfirmRemove>,
    );

    fireEvent.click(screen.getByRole("button", { name: "No, mantenerlo" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Sí, quitarlo" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
