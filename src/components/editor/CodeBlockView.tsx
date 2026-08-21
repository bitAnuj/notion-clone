import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

function CodeBlockView({ node, updateAttributes, extension }: NodeViewProps) {
  const languages: string[] =
    extension.options.lowlight?.listLanguages?.() ?? [];

  return (
    <NodeViewWrapper className="group relative my-1">
      <select
        contentEditable={false}
        value={node.attrs.language || ""}
        onChange={(e) =>
          updateAttributes({ language: e.target.value || null })
        }
        className="absolute right-2 top-2 z-10 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 opacity-0 outline-none group-hover:opacity-100"
      >
        <option value="">Auto</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <pre>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

export default CodeBlockView;
