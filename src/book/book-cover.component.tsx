import { useState } from "react";
import { coverColorFor } from "src/book/book.model";
import styles from "./book-cover.module.css";

type BookCoverProps = {
  title: string;
  coverUrl?: string;
  size?: "small" | "medium";
};

// Decorative, like ChildAvatar: the cover always sits next to visible title
// text, which is the accessible name.
export function BookCover({
  title,
  coverUrl,
  size = "medium",
}: BookCoverProps) {
  const [failed, setFailed] = useState(false);

  if (coverUrl && !failed) {
    return (
      <img
        className={`${styles.cover} ${styles[size]}`}
        src={coverUrl}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${styles.cover} ${styles.placeholder} ${styles[size]}`}
      style={{ background: coverColorFor(title) }}
      aria-hidden="true"
    >
      {[...title][0]?.toUpperCase() ?? "?"}
    </span>
  );
}
