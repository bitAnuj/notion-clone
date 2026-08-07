import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { ChevronRight } from "lucide-react";

function ToggleView({ node, updateAttributes }: NodeViewProps) {
  const open = node.attrs.open as boolean;
  const title = node.attrs.title as string;

  return (
    <NodeViewWrapper className="my-1">
      <div className="flex items-start gap-1">
        <button
          contentEditable={false}
          onClick={() => updateAttributes({ open: !open })}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-zinc-800"
        >
          <ChevronRight
            size={14}
            className={`transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>

        <div className="flex-1">
          <input
            contentEditable={false}
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Toggle title"
            className="w-full bg-transparent py-1 font-medium outline-none placeholder:text-zinc-500"
          />

          <div className={open ? "block pl-1" : "hidden"}>
            <NodeViewContent />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default ToggleView;
