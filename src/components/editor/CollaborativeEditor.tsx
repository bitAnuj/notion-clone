import { useEffect, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, LiveblocksRoomProvider, useOthersMapped } from "../../lib/liveblocks";
import { getOrCreateCollabUser } from "../../lib/collabUser";
import NotionEditor from "./NotionEditor";
import { Users } from "lucide-react";

type Props = {
  pageId: string;
};

function CollaborativeEditorInner({ pageId }: Props) {
  const room = useRoom();
  const others = useOthersMapped((other) => other);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const collabUser = getOrCreateCollabUser();

  useEffect(() => {
    console.log("Room status:", room.getStatus());

    const newYdoc = new Y.Doc();
    const newProvider = new LiveblocksYjsProvider(room, newYdoc);

    setYdoc(newYdoc);
    setProvider(newProvider);

    newProvider.on("sync", (synced: boolean) => {
      console.log("Sync event:", synced);
      setIsSynced(synced);
    });

    newProvider.on("error", (err: any) => {
      console.error("Provider error:", err);
      setError(err.message);
    });

    return () => {
      newProvider.destroy();
      newYdoc.destroy();
      setYdoc(null);
      setProvider(null);
      setIsSynced(false);
    };
  }, [room]);

  if (error) {
    return <div className="flex h-64 items-center justify-center text-red-400">Error: {error}</div>;
  }

  if (!ydoc || !provider || !isSynced) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500">
        Connecting…
      </div>
    );
  }

  const yFragment = ydoc.getXmlFragment("content");

  return (
    <>
      <NotionEditor
        pageId={pageId}
        yFragment={yFragment}
        provider={provider}
        collabUser={collabUser}
      />
      {others.length > 0 && (
        <div className="fixed bottom-4 right-4 flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-zinc-700">
          <Users size={14} />
          <span>{others.length} other{others.length > 1 ? "s" : ""} editing</span>
        </div>
      )}
    </>
  );
}

export default function CollaborativeEditor({ pageId }: Props) {
  return (
    <LiveblocksRoomProvider id={`page-${pageId}`} initialPresence={{}}>
      <CollaborativeEditorInner pageId={pageId} />
    </LiveblocksRoomProvider>
  );
}
