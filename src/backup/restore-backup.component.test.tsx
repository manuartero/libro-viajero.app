import { fireEvent, render, screen } from "@testing-library/react";
import type { AppData } from "src/app-data/app-data.model";
import { RestoreBackup } from "src/backup/restore-backup.component";
import { describe, expect, it, vi } from "vitest";

const appData: AppData = {
  projects: [
    {
      id: "p1",
      name: "Los Caracoles 2025/26",
      children: [{ id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" }],
      books: [{ id: "b1", title: "Elmer" }],
      currentAssignments: [],
      history: [],
    },
  ],
  activeProjectId: "p1",
};

// The picker is the browser's; the test hands the file straight to the input,
// which is where the component takes over.
const pickFile = (contents: string, name = "libro-viajero-2026-06-20.json") => {
  fireEvent.click(screen.getByRole("button", { name: "Recuperar una copia" }));
  fireEvent.change(screen.getByLabelText("Archivo de la copia"), {
    target: { files: [new File([contents], name)] },
  });
};

const findPreview = () =>
  screen.findByRole("region", { name: "Los Caracoles 2025/26" });

describe("<RestoreBackup />", () => {
  it("shows the class inside the copy before touching anything", async () => {
    const onRestore = vi.fn(() => true);
    render(<RestoreBackup onRestore={onRestore} />);

    pickFile(JSON.stringify(appData));

    const preview = await findPreview();
    expect(preview.textContent).toContain("Copia del 20 de junio de 2026");
    expect(preview.textContent).toContain("1 peque · 1 libro");
    expect(onRestore).not.toHaveBeenCalled();
  });

  it("restores on confirm and folds back to the link", async () => {
    const onRestore = vi.fn(() => true);
    render(<RestoreBackup onRestore={onRestore} />);
    pickFile(JSON.stringify(appData));
    await findPreview();

    fireEvent.click(
      screen.getByRole("button", { name: "Sí, recuperar esta clase" }),
    );

    expect(onRestore).toHaveBeenCalledWith(appData);
    expect(
      screen.getByRole("button", { name: "Recuperar una copia" }),
    ).toBeDefined();
  });

  it("keeps the preview up when the save fails, for a retry", async () => {
    render(<RestoreBackup onRestore={() => false} />);
    pickFile(JSON.stringify(appData));
    await findPreview();

    fireEvent.click(
      screen.getByRole("button", { name: "Sí, recuperar esta clase" }),
    );

    expect(
      screen.getByRole("region", { name: "Los Caracoles 2025/26" }),
    ).toBeDefined();
  });

  it("names the class about to be replaced, and backs out on cancel", async () => {
    const onRestore = vi.fn(() => true);
    render(
      <RestoreBackup replacing="Los Caracoles 2026/27" onRestore={onRestore} />,
    );
    pickFile(JSON.stringify(appData));
    await findPreview();

    expect(
      screen.getByText(
        "Sustituirá a «Los Caracoles 2026/27» en este teléfono.",
      ),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", { name: "No, dejarlo como está" }),
    );

    expect(onRestore).not.toHaveBeenCalled();
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("says when the file is not a copy, and stays ready for another", async () => {
    render(<RestoreBackup onRestore={() => true} />);

    pickFile("{not json", "notas.json");

    expect((await screen.findByRole("alert")).textContent).toContain(
      "no es una copia de Libro viajero",
    );
    expect(
      screen.getByRole("button", { name: "Recuperar una copia" }),
    ).toBeDefined();
  });
});
