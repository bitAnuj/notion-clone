import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { ExternalLink } from "lucide-react";

function getEmbedSrc(url: string): string {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  return url;
}

function EmbedView({ node }: NodeViewProps) {
  const url = node.attrs.url as string;

  if (!url) return null;

  return (
    <NodeViewWrapper className="my-2">
      <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
        <iframe
          src={getEmbedSrc(url)}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 border-t border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200"
        <a>
          <ExternalLink size={12} />
          {url}
        </a>
      </div>
    </NodeViewWrapper>
  );
}

export default EmbedView;
