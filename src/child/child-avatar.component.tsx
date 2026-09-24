import type { Child } from "src/child/child.model";
import styles from "./child-avatar.module.css";

type ChildAvatarProps = {
  child: Pick<Child, "emoji" | "color">;
  size?: "tiny" | "small" | "medium" | "large";
};

export function ChildAvatar({
  child: { emoji, color },
  size = "medium",
}: ChildAvatarProps) {
  return (
    <span
      className={`${styles.avatar} ${styles[size]}`}
      style={{ background: color }}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}
