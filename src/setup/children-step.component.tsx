import { useState } from "react";
import type { Child, ChildDraft } from "src/child/child.model";
import { ChildBuilder } from "src/setup/child-builder.component";
import { Roster } from "src/setup/roster.component";
import styles from "./children-step.module.css";

type ChildrenStepProps = {
  classroomName: string;
  yearShort: string;
  childList: Child[];
  onBack: () => void;
  onAdd: (draft: ChildDraft) => void;
  onSave: (child: Child) => void;
  onRemove: (childId: string) => void;
  onCreate: () => void;
};

const pluralPeques = (count: number) =>
  count === 1 ? "1 peque" : `${count} peques`;

export function ChildrenStep({
  classroomName,
  yearShort,
  childList,
  onBack,
  onAdd,
  onSave,
  onRemove,
  onCreate,
}: ChildrenStepProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = childList.find((child) => child.id === editingId) ?? null;
  const others = childList.filter((child) => child.id !== editingId);
  const usedEmojis = others.map((child) => child.emoji);
  const usedColors = others.map((child) => child.color);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          aria-label="Volver al nombre de la clase"
          onClick={onBack}
        >
          ←
        </button>
        <div className={styles.mastheadBlock}>
          <p className={styles.masthead}>{classroomName}</p>
          <p className={styles.dateline}>
            Curso {yearShort} · {pluralPeques(childList.length)}
          </p>
        </div>
      </header>

      <main className={styles.main}>
        {/* The key remounts the builder: ChildBuilder seeds its state from
            `editing` once, so a fresh form per add / reload per edit depends
            on this remount. */}
        <ChildBuilder
          key={editing?.id ?? `new-${childList.length}`}
          usedEmojis={usedEmojis}
          usedColors={usedColors}
          editing={editing}
          onAdd={onAdd}
          onSave={(child) => {
            onSave(child);
            setEditingId(null);
          }}
          onRemove={(childId) => {
            onRemove(childId);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />

        <Roster
          childList={childList}
          editingId={editingId}
          onSelect={(childId) =>
            setEditingId((prev) => (prev === childId ? null : childId))
          }
        />
      </main>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.create}
          disabled={childList.length === 0}
          onClick={onCreate}
        >
          Crear la clase
          {childList.length > 0 ? ` (${pluralPeques(childList.length)})` : ""}
        </button>
      </footer>
    </div>
  );
}
