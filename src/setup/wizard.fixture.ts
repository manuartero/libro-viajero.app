import { fireEvent, screen } from "@testing-library/react";

// Shared driver + fixtures for tests that walk the setup wizard UI
// (setup-wizard, app, assign-step, roster tests).

export const childList = [
  { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" },
  { id: "c2", tag: "Dino", emoji: "🦕", color: "#ffca3a" },
];

export const bookList = [
  { id: "b1", title: "Elmer" },
  { id: "b2", title: "La oruga" },
];

export const nameTheClass = (name: string) => {
  fireEvent.change(screen.getByLabelText("¿Cómo se llama tu clase?"), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: "Añadir peques →" }));
};

export const addChild = (emojiName: string) => {
  fireEvent.click(screen.getByRole("button", { name: emojiName }));
  fireEvent.click(screen.getByRole("button", { name: "Añadir a la clase" }));
};

export const goToBooks = () => {
  fireEvent.click(screen.getByRole("button", { name: "Añadir libros →" }));
};

// Manual entry keeps wizard-level tests free of fetch stubbing.
export const addBookManually = (title: string) => {
  fireEvent.click(
    screen.getByRole("button", { name: "¿No lo encuentras? Añádelo a mano" }),
  );
  fireEvent.change(screen.getByLabelText("Título"), {
    target: { value: title },
  });
  fireEvent.click(screen.getByRole("button", { name: "Añadir libro" }));
};

export const goToAssign = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "Elegir lector para cada libro →" }),
  );
};

// Drives the whole wizard with one child and one book: the minimal happy path.
export const createClass = (name: string) => {
  nameTheClass(name);
  addChild("Rana");
  goToBooks();
  addBookManually("Elmer");
  goToAssign();
  fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
  fireEvent.click(screen.getByRole("button", { name: "Crear la clase" }));
};
