import { fireEvent, render, screen } from "@testing-library/react";
import { PrivacyNote } from "src/dashboard/privacy-note.component";
import { describe, expect, it, vi } from "vitest";

// The focus contract (trap, Escape, return to trigger) is the platform's and
// jsdom stubs <dialog>, so it is checked in a real browser, not here.
const openNote = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "Tus datos y privacidad" }),
  );
};

describe("<PrivacyNote />", () => {
  it("stays closed until the teacher asks", () => {
    render(
      <PrivacyNote
        projectName="Los Caracoles 2026/27"
        onDownloadData={() => {}}
        onRestoreData={() => true}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a dialog that states the privacy promise", () => {
    render(
      <PrivacyNote
        projectName="Los Caracoles 2026/27"
        onDownloadData={() => {}}
        onRestoreData={() => true}
      />,
    );

    openNote();

    expect(screen.getByRole("dialog", { name: "Tus datos" })).toBeDefined();
    expect(
      screen.getByText("Ningún dato sale de tu teléfono sin que tú lo sepas."),
    ).toBeDefined();
  });

  it("hands the download over to the caller", () => {
    const onDownloadData = vi.fn();
    render(
      <PrivacyNote
        projectName="Los Caracoles 2026/27"
        onDownloadData={onDownloadData}
        onRestoreData={() => true}
      />,
    );

    openNote();
    fireEvent.click(
      screen.getByRole("button", { name: "Descargar mis datos" }),
    );

    expect(onDownloadData).toHaveBeenCalledTimes(1);
  });

  it("closes with the button", () => {
    render(
      <PrivacyNote
        projectName="Los Caracoles 2026/27"
        onDownloadData={() => {}}
        onRestoreData={() => true}
      />,
    );

    openNote();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the panel out of reach while it is closed", () => {
    render(
      <PrivacyNote
        projectName="Los Caracoles 2026/27"
        onDownloadData={() => {}}
        onRestoreData={() => true}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Descargar mis datos" }),
    ).toBeNull();
  });
});
