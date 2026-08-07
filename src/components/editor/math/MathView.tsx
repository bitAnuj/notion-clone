import { useEffect, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import katex from "katex";

function MathView({ node, updateAttributes }: NodeViewProps) {
  const latex = node.attrs.latex as string;
  const [editing, setEditing] = useState(!latex);
  const [draft, setDraft] = useState(latex);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing || !previewRef.current) return;

    try {
      katex.render(latex || "", previewRef.current, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      if (previewRef.current) previewRef.current.textContent = latex;
    }
  }, [latex, editing]);

  const save = () => {
    updateAttributes({ latex: draft });
    setEditing(false);
  };

  return (
    <NodeViewWrapper className="my-2">
      {editing ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
            }}
            onBlur={save}
            placeholder="Type LaTeX, e.g. E = mc^2"
            className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-zinc-500"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Press Enter to render
          </p>
        </div>
      ) : (
        <div
          onClick={() => {
            setDraft(latex);
            setEditing(true);
          }}
          className="cursor-pointer overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-center"
        >
          <div ref={previewRef} />
        </div>
      )}
    </NodeViewWrapper>
  );
}

export default MathView;
