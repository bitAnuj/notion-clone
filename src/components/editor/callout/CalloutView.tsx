import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

const EMOJIS = ["💡", "⚠️", "✅", "📌", "🔥", "❗", "📝", "🎯"];

function CalloutView({ node, updateAttributes }: NodeViewProps) {
  const emoji = node.attrs.emoji as string;

  const cycleEmoji = () => {
    const currentIndex = EMOJIS.indexOf(emoji);
    const next = EMOJIS[(currentIndex + 1) % EMOJIS.length];
    updateAttributes({ emoji: next });
  };

  return (
    <NodeViewWrapper className="my-2 flex gap-3 rounded-lg bg-zinc-800 p-4">
      <button
        contentEditable={false}
        onClick={cycleEmoji}
        className="h-6 w-6 shrink-0 text-xl leading-none"
        title="Click to change icon"
      >
        {emoji}
      </button>
      <NodeViewContent className="flex-1 outline-none" />
    </NodeViewWrapper>
  );
}

export default CalloutView;
