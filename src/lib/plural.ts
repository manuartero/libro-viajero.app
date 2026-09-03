// Every count the UI says out loud is a regular Spanish plural: "1 peque" /
// "3 peques", "1 libro" / "0 libros".
export function plural({ count, noun }: { count: number; noun: string }) {
  return count === 1 ? `1 ${noun}` : `${count} ${noun}s`;
}
