import { fireEvent, render, screen } from "@testing-library/react";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { describe, expect, it, vi } from "vitest";

// The focus contract — focus into the dialog on open, back to the trigger on
// close, Tab held inside, Escape cancelling — now belongs to the platform,
// and jsdom implements none of it (its HTMLDialogElement is an empty stub).
// Asserting it against the stub in test/setup.ts would only assert the stub,
// so those four checks live in a real browser instead. What is left here is
// the part this component still decides.
const openNote = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "Tus datos y privacidad" }),
  );
};

describe("<PrivacyNote />", () => {
  it("stays closed until the teacher asks", () => {
    render(<PrivacyNote onDownloadData={() => {}} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a dialog that states the privacy promise", () => {
    render(<PrivacyNote onDownloadData={() => {}} />);

    openNote();

    expect(screen.getByRole("dialog", { name: "Tus datos" })).toBeDefined();
    expect(
      screen.getByText("Ningún dato sale de tu teléfono sin que tú lo sepas."),
    ).toBeDefined();
  });

  it("hands the download over to the caller", () => {
    const onDownloadData = vi.fn();
    render(<PrivacyNote onDownloadData={onDownloadData} />);

    openNote();
    fireEvent.click(
      screen.getByRole("button", { name: "Descargar mis datos" }),
    );

    expect(onDownloadData).toHaveBeenCalledTimes(1);
  });

  it("closes with the button", () => {
    render(<PrivacyNote onDownloadData={() => {}} />);

    openNote();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the panel out of reach while it is closed", () => {
    render(<PrivacyNote onDownloadData={() => {}} />);

    expect(
      screen.queryByRole("button", { name: "Descargar mis datos" }),
    ).toBeNull();
  });
});
