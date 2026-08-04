import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { GripVertical } from "lucide-react";

type BlockDragHandleProps = {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

function topLevelPosAt(editor: Editor, clientX: number, clientY: number) {
  const coords = editor.view.posAtCoords({ left: clientX, top: clientY });
  if (!coords) return null;

  const $pos = editor.state.doc.resolve(coords.pos);
  const before = $pos.depth >= 1 ? $pos.before(1) : coords.pos;
  const node = editor.state.doc.nodeAt(before);
  if (!node) return null;

  return { pos: before, size: node.nodeSize };
}

function BlockDragHandle({ editor, containerRef }: BlockDragHandleProps) {
  const [top, setTop] = useState<number | null>(null);
  const hoveredPos = useRef<{ pos: number; size: number } | null>(null);
  const draggingPos = useRef<{ pos: number; size: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onMouseMove(e: MouseEvent) {
      const result = topLevelPosAt(editor, e.clientX, e.clientY);
      if (!result) return;

      hoveredPos.current = result;

      const dom = editor.view.nodeDOM(result.pos) as HTMLElement | null;
      if (!dom || !container) return;

      const containerRect = container.getBoundingClientRect();
      const domRect = dom.getBoundingClientRect();
      setTop(domRect.top - containerRect.top);
    }

    function onDragOver(e: DragEvent) {
      e.preventDefault();
    }

    function onDrop(e: DragEvent) {
      e.preventDefault();
      const from = draggingPos.current;
      const target = topLevelPosAt(editor, e.clientX, e.clientY);
      if (!from || !target) return;

      const { state, view } = editor;
      const node = state.doc.nodeAt(from.pos);
      if (!node) return;

      const dom = editor.view.nodeDOM(target.pos) as HTMLElement | null;
      let insertAt = target.pos;
      if (dom) {
        const rect = dom.getBoundingClientRect();
        const isBelow = e.clientY > rect.top + rect.height / 2;
        insertAt = isBelow ? target.pos + target.size : target.pos;
      }

      if (insertAt >= from.pos && insertAt <= from.pos + from.size) return;

      const tr = state.tr;
      tr.delete(from.pos, from.pos + from.size);

      let adjusted = insertAt;
      if (insertAt > from.pos) adjusted -= from.size;

      tr.insert(adjusted, node);
      view.dispatch(tr);
      draggingPos.current = null;
    }

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("dragover", onDragOver);
    container.addEventListener("drop", onDrop);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("dragover", onDragOver);
      container.removeEventListener("drop", onDrop);
    };
  }, [editor, containerRef]);

  if (top === null) return null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        draggingPos.current = hoveredPos.current;
        e.dataTransfer.effectAllowed = "move";
      }}
      style={{ position: "absolute", top, left: -28 }}
      className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 active:cursor-grabbing"
    >
      <GripVertical size={16} />
    </div>
  );
}

export default BlockDragHandle;
