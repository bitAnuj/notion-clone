import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Callout from "./callout/Callout";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import ToggleBlock from "./toggle/ToggleBlock";
import EmbedBlock from "./embed/Embed";
import MathBlock from "./math/MathBlock";
import { Column, Columns } from "./columns/Columns";
import DatabaseBlock from "./database/DatabaseBlock";
import FileBlock from "./file/FileBlock";
import SelectionToolbar from "./SelectionToolbar";
import { Download } from "lucide-react";
import { exportPageAsMarkdown } from "../../lib/exportMarkdown";
import { useEffect, useMemo, useRef } from "react";
import { usePageStore } from "../../store/usePageStore";
import SlashCommand from "./slash-command/SlashCommand";
import BlockDragHandle from "./BlockDragHandle";
import { createPageMention } from "./mention/PageMention";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";

const lowlight = createLowlight(common);

function NotionEditor({ pageId }: { pageId: string }) {
  const { pages, updateContent, selectPage } = usePageStore();

  const page = pages.find((p) => p.id === pageId);

  const containerRef = useRef<HTMLDivElement>(null);

  // Always holds the latest pages list, so the @ mention menu
  // can see newly created pages without rebuilding the editor.
  const pagesRef = useMemo(() => ({ current: pages }), []);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  const liveblocks = useLiveblocksExtension({
    initialContent: page?.content || "<p></p>",
  });

  const editor = useEditor({
    extensions: [
      liveblocks,
      StarterKit.configure({
        codeBlock: false,
        undoRedo: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading";
          return "Type '/' for commands...";
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline cursor-pointer",
        },
      }),
      Callout,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ToggleBlock,
      EmbedBlock,
      MathBlock,
      Column,
      Columns,
      DatabaseBlock,
      FileBlock,
      SlashCommand,
      createPageMention(pagesRef),
    ],

    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[700px] outline-none " +
          "prose-headings:font-semibold prose-p:my-1 " +
          "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 " +
          "[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:gap-2 " +
          "[&_ul[data-type=taskList]_input]:mt-1.5",
      },
    },

    onUpdate({ editor }) {
      updateContent(pageId, editor.getHTML());
    },
  });

  // Clicking a mention pill navigates to that page.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest(
        '[data-type="mention"]'
      );
      if (!target) return;

      const id = target.getAttribute("data-id");
      if (id) selectPage(id);
    }

    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [selectPage]);

  if (!editor) return null;

  const text = editor.getText();
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() =>
          exportPageAsMarkdown(page?.title ?? "Untitled", editor.getHTML())
        }
        className="mb-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Download size={14} />
        Export as Markdown
      </button>
      <SelectionToolbar editor={editor} />
      <BlockDragHandle editor={editor} containerRef={containerRef} />
      <EditorContent editor={editor} />
      <p className="mt-6 text-xs text-zinc-600">
        {wordCount} words · {charCount} characters
      </p>
    </div>
  );
}

export default NotionEditor;
