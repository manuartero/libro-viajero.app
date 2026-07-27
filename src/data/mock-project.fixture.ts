import type { Project } from "src/project/project.model";

const CHILDREN = [
  { id: "c01", tag: "Verde", emoji: "🐸", color: "#8ac926" },
  { id: "c02", tag: "Sol", emoji: "🌞", color: "#ffca3a" },
  { id: "c03", tag: "Pirata", emoji: "🏴‍☠️", color: "#6a4c93" },
  { id: "c04", tag: "Luna", emoji: "🌙", color: "#4267ac" },
  { id: "c05", tag: "Dino", emoji: "🦕", color: "#52a675" },
  { id: "c06", tag: "Fresa", emoji: "🍓", color: "#ff595e" },
  { id: "c07", tag: "Cohete", emoji: "🚀", color: "#1982c4" },
  { id: "c08", tag: "Búho", emoji: "🦉", color: "#b5838d" },
  { id: "c09", tag: "Nube", emoji: "☁️", color: "#98c1d9" },
  { id: "c10", tag: "Tigre", emoji: "🐯", color: "#f3722c" },
  { id: "c11", tag: "Flor", emoji: "🌸", color: "#f49cbb" },
  { id: "c12", tag: "Robot", emoji: "🤖", color: "#8d99ae" },
];

const BOOKS = [
  { id: "b01", title: "La oruga glotona", author: "Eric Carle" },
  { id: "b02", title: "¿A qué sabe la luna?", author: "Michael Grejniec" },
  { id: "b03", title: "El monstruo de colores", author: "Anna Llenas" },
  { id: "b04", title: "Adivina cuánto te quiero", author: "Sam McBratney" },
  { id: "b05", title: "Elmer", author: "David McKee" },
  { id: "b06", title: "El pez arcoíris", author: "Marcus Pfister" },
  { id: "b07", title: "Donde viven los monstruos", author: "Maurice Sendak" },
  { id: "b08", title: "La cebra Camila", author: "Marisa Núñez" },
  { id: "b09", title: "El pollo Pepe", author: "Nick Denchfield" },
  { id: "b10", title: "Un bicho extraño", author: "Mon Daporta" },
  { id: "b11", title: "Vamos a cazar un oso", author: "Michael Rosen" },
  { id: "b12", title: "El grúfalo", author: "Julia Donaldson" },
];

export const mockProject: Project = {
  id: "p01",
  name: "Clase Caracoles 2026-27",
  children: CHILDREN,
  books: BOOKS,
  currentAssignments: CHILDREN.map((child, i) => ({
    childId: child.id,
    bookId: BOOKS[i].id,
    weekStart: "2026-07-20",
  })),
  history: [],
};
