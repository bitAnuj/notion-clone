import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { usePageStore } from "../../store/usePageStore";
import SlashCommand from "./slash-command/SlashCommand";
import BlockDragHandle from "./BlockDragHandle";

function NotionEditor() {
  const { pages, selectedPageId, updateContent } = usePageStore();

  const page = pages.find((p) => p.id === selectedPageId);

  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
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
      SlashCommand,
    ],

    content: page?.content || "<p></p>",

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
      if (!page) return;
      updateContent(page.id, editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || !page) return;

    if (editor.getHTML() !== page.content) {
      editor.commands.setContent(page.content || "<p></p>", {
        emitUpdate: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageId]);

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative">
      <BlockDragHandle editor={editor} containerRef={containerRef} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default NotionEditor;
