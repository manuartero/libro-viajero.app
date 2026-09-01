import type { ReactNode } from "react";
import styles from "./child-avatar.module.css";

type ChildAvatarProps = {
  emoji: string;
  color: string;
  size?: "tiny" | "small" | "medium" | "large";
  children?: ReactNode; // overlays, e.g. the returned stamp
};

export function ChildAvatar({
  emoji,
  color,
  size = "medium",
  children,
}: ChildAvatarProps) {
  return (
    <span
      className={`${styles.avatar} ${styles[size]}`}
      style={{ background: color }}
      aria-hidden="true"
    >
      {emoji}
      {children}
    </span>
  );
}
