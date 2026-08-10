import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  GripVertical,
  Plus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
} from "lucide-react";

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

const TURN_INTO_OPTIONS = [
  {
    title: "Text",
    icon: Type,
    run: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: "Heading 1",
    icon: Heading1,
    run: (editor: Editor) =>
      editor.chain().focus().setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Heading 2",
    icon: Heading2,
    run: (editor: Editor) =>
      editor.chain().focus().setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3",
    icon: Heading3,
    run: (editor: Editor) =>
      editor.chain().focus().setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bulleted list",
    icon: List,
    run: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    icon: ListOrdered,
    run: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "To-do list",
    icon: ListTodo,
    run: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: "Quote",
    icon: Quote,
    run: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

function BlockDragHandle({ editor, containerRef }: BlockDragHandleProps) {
  const [top, setTop] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const insertBelow = () => {
    const hovered = hoveredPos.current;
    if (!hovered) return;

    const insertAt = hovered.pos + hovered.size;

    editor
      .chain()
      .focus()
      .insertContentAt(insertAt, { type: "paragraph" })
      .setTextSelection(insertAt + 1)
      .run();
  };

  const turnInto = (run: (editor: Editor) => void) => {
    const hovered = hoveredPos.current;
    if (!hovered) return;

    editor.chain().focus().setTextSelection(hovered.pos + 1).run();
    run(editor);
    setMenuOpen(false);
  };

  return (
    <div
      style={{ position: "absolute", top, left: -52 }}
      className="flex items-center gap-0.5"
    >
      <button
        onClick={insertBelow}
        className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800"
        title="Add block below"
      >
        <Plus size={16} />
      </button>

      <div className="relative">
        <div
          draggable
          onClick={() => setMenuOpen((o) => !o)}
          onDragStart={(e) => {
            draggingPos.current = hoveredPos.current;
            e.dataTransfer.effectAllowed = "move";
          }}
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </div>

        {menuOpen && (
          <div className="absolute left-0 top-7 z-50 w-44 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
            <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              Turn into
            </p>
            {TURN_INTO_OPTIONS.map(({ title, icon: Icon, run }) => (
              <button
                key={title}
                onClick={() => turnInto(run)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <Icon size={14} className="text-zinc-500" />
                {title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockDragHandle;
