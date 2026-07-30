import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { usePageStore } from "../../store/usePageStore";

function NotionEditor() {
  const {
    pages,
    selectedPageId,
    updateContent,
  } = usePageStore();

  const page = pages.find((p) => p.id === selectedPageId);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],

    content: page?.content || "<p></p>",

    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[700px] outline-none",
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
      editor.commands.setContent(page.content || "<p></p>", false);
    }
  }, [editor, page]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}

export default NotionEditor;
