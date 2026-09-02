import { fireEvent, render, screen } from "@testing-library/react";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { describe, expect, it, vi } from "vitest";

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

  it("closes with Escape", () => {
    render(<PrivacyNote onDownloadData={() => {}} />);

    openNote();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
