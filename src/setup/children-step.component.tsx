import { useState } from "react";
import type { Child, ChildDraft } from "src/child/child.model";
import { ChildBuilder } from "src/setup/child-builder.component";
import { Roster } from "src/setup/roster.component";
import { StepScreen } from "src/setup/step-screen.component";
import styles from "./step-screen.module.css";

type ChildrenStepProps = {
  classroomName: string;
  yearShort: string;
  childList: Child[];
  onBack: () => void;
  onAdd: (draft: ChildDraft) => void;
  onSave: (child: Child) => void;
  onRemove: (childId: string) => void;
  onNext: () => void;
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
  onNext,
}: ChildrenStepProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = childList.find((child) => child.id === editingId) ?? null;
  const others = childList.filter((child) => child.id !== editingId);
  const usedEmojis = others.map((child) => child.emoji);
  const usedColors = others.map((child) => child.color);

  return (
    <StepScreen
      classroomName={classroomName}
      dateline={`Paso 2 de 4 · Curso ${yearShort} · ${pluralPeques(childList.length)}`}
      backLabel="Volver al nombre de la clase"
      onBack={onBack}
      footer={
        <button
          type="button"
          className={styles.create}
          disabled={childList.length === 0}
          onClick={onNext}
        >
          Añadir libros →
        </button>
      }
    >
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
    </StepScreen>
  );
}
