// Spanish count labels: "1 peque" / "3 peques".
export const pluralize = ({
  count,
  singular,
  plural,
}: {
  count: number;
  singular: string;
  plural: string;
}) => (count === 1 ? `1 ${singular}` : `${count} ${plural}`);
