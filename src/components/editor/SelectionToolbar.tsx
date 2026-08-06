import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { Bold, Code, Highlighter, Italic, Link as LinkIcon, Strikethrough } from "lucide-react";
type SelectionToolbarProps = {
  editor: Editor;
};

function SelectionToolbar({ editor }: SelectionToolbarProps) {
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
      <div className="flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
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
              </div>
            </BubbleMenu>
  );
}

export default SelectionToolbar;
