import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { FileIcon, Download } from "lucide-react";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileView({ node }: NodeViewProps) {
  const { name, size, dataUrl } = node.attrs as {
    name: string;
    size: number;
    dataUrl: string;
  };

  if (!dataUrl) return null;

  return (
    <NodeViewWrapper className="my-2" contentEditable={false}>
      <a
        href={dataUrl}
        download={name}
        className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-3 hover:bg-zinc-750"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-700 text-zinc-300">
          <FileIcon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-zinc-200">
            {name}
          </span>
          <span className="block text-xs text-zinc-500">
            {formatSize(size)}
          </span>
        </span>
        <Download size={16} className="shrink-0 text-zinc-500" />
      </a>
    </NodeViewWrapper>
  );
}

export default FileView;
