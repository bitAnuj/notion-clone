import { useRef, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Highlighter,
  Italic,
  Link as LinkIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Baseline,
} from "lucide-react";
import { useClickOutside } from "../../lib/useClickOutside";

type SelectionToolbarProps = {
  editor: Editor;
};

const TEXT_COLORS = [
  { name: "Default", value: "" },
  { name: "Red", value: "#f87171" },
  { name: "Orange", value: "#fb923c" },
  { name: "Yellow", value: "#facc15" },
  { name: "Green", value: "#4ade80" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Purple", value: "#c084fc" },
  { name: "Pink", value: "#f472b6" },
];

function SelectionToolbar({ editor }: SelectionToolbarProps) {
  const [colorOpen, setColorOpen] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement>(null);
    useClickOutside(colorMenuRef, () => setColorOpen(false));

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as
      | string
      | undefined;
    const url = window.prompt("Enter a URL", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <BubbleMenu editor={editor}>
      <div
              ref={colorMenuRef}
              className="relative flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl"
            >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive("bold") ? "text-blue-400" : "text-zinc-300"
          }`}
        >
          <Bold size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive("italic") ? "text-blue-400" : "text-zinc-300"
          }`}
        >
          <Italic size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive("strike") ? "text-blue-400" : "text-zinc-300"
          }`}
        >
          <Strikethrough size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive("code") ? "text-blue-400" : "text-zinc-300"
          }`}
        >
          <Code size={15} />
        </button>
        <button
          onClick={setLink}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive("link") ? "text-blue-400" : "text-zinc-300"
          }`}
        >
          <LinkIcon size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive("highlight") ? "text-yellow-400" : "text-zinc-300"
          }`}
        >
          <Highlighter size={15} />
        </button>

        <button
          onClick={() => setColorOpen((o) => !o)}
          className="rounded p-1.5 text-zinc-300 hover:bg-zinc-800"
        >
          <Baseline size={15} />
        </button>

        {colorOpen && (
          <div className="absolute left-0 top-9 z-10 flex gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1.5 shadow-xl">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.name}
                title={c.name}
                onClick={() => {
                  if (c.value) {
                    editor.chain().focus().setColor(c.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                  setColorOpen(false);
                }}
                className="h-6 w-6 rounded-full border border-zinc-600"
                style={{ backgroundColor: c.value || "#71717a" }}
              />
            ))}
          </div>
        )}

        <div className="mx-0.5 h-5 w-px bg-zinc-700" />

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive({ textAlign: "left" })
              ? "text-blue-400"
              : "text-zinc-300"
          }`}
        >
          <AlignLeft size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive({ textAlign: "center" })
              ? "text-blue-400"
              : "text-zinc-300"
          }`}
        >
          <AlignCenter size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`rounded p-1.5 hover:bg-zinc-800 ${
            editor.isActive({ textAlign: "right" })
              ? "text-blue-400"
              : "text-zinc-300"
          }`}
        >
          <AlignRight size={15} />
        </button>
      </div>
    </BubbleMenu>
  );
}

export default SelectionToolbar;
