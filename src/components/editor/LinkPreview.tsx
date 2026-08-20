import { createPortal } from "react-dom";

interface LinkPreviewProps {
  metadata: {
    title: string;
    description: string;
    image?: string;
    favicon?: string;
    url: string;
  } | null;
  position: { x: number; y: number } | null;
}

export default function LinkPreview({ metadata, position }: LinkPreviewProps) {
  if (!metadata || !position) return null;

  return createPortal(
    <div
      className="fixed z-[200] pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      <div className="w-80 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl p-3 text-sm">
        {metadata.favicon && (
          <img src={metadata.favicon} alt="" className="h-4 w-4 rounded mb-2" />
        )}
        <p className="font-semibold text-zinc-100 truncate">{metadata.title}</p>
        {metadata.description && (
          <p className="mt-1 text-zinc-400 line-clamp-2">{metadata.description}</p>
        )}
        {metadata.image && (
          <img
            src={metadata.image}
            alt=""
            className="mt-2 rounded-md max-h-40 w-full object-cover"
          />
        )}
        <p className="mt-2 text-xs text-zinc-500 truncate">{metadata.url}</p>
      </div>
    </div>,
    document.body
  );
}
