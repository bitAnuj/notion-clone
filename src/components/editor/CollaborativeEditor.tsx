import { useEffect } from "react";
import { LiveblocksRoomProvider, useUpdateMyPresence, useRoom } from "../../lib/liveblocks";
import { useAuthStore } from "../../store/useAuthStore";
import { getOrCreateCollabUser, COLLAB_NAME_CHANGE_EVENT } from "../../lib/collabUser";
import NotionEditor from "./NotionEditor";

type Props = { pageId: string };

function PresenceNameSync() {
  const updateMyPresence = useUpdateMyPresence();
  const room = useRoom();
  const authName = useAuthStore((s) => s.user?.name);

  useEffect(() => {
    const name = authName?.trim() || getOrCreateCollabUser().name || "Guest";
    const color = getOrCreateCollabUser().color || "#4f46e5";
    updateMyPresence({
      displayName: name,
      user: { name, color },
      liveblocksTiptap: {
        user: { name, color },
      },
    });
  }, [authName, updateMyPresence]);

  useEffect(() => {
    function handleNameChange(e: Event) {
      const detail = (e as CustomEvent<{ name?: string }>).detail;
      if (detail?.name) {
        const color = getOrCreateCollabUser().color || "#4f46e5";
        updateMyPresence({
          displayName: detail.name,
          user: { name: detail.name, color },
          liveblocksTiptap: {
            user: { name: detail.name, color },
          },
        });
        try {
          room.reconnect();
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener(COLLAB_NAME_CHANGE_EVENT, handleNameChange);
    return () => window.removeEventListener(COLLAB_NAME_CHANGE_EVENT, handleNameChange);
  }, [updateMyPresence, room]);

  return null;
}

export default function CollaborativeEditor({ pageId }: Props) {
  const authUser = useAuthStore((s) => s.user);
  const currentName = authUser?.name?.trim() || getOrCreateCollabUser().name || "Guest";
  const currentColor = getOrCreateCollabUser().color || "#4f46e5";

  return (
    <LiveblocksRoomProvider
      key={`page-${pageId}`}
      id={`page-${pageId}`}
      initialPresence={{
        displayName: currentName,
        user: { name: currentName, color: currentColor },
        liveblocksTiptap: {
          user: { name: currentName, color: currentColor },
        },
      }}
    >
      <PresenceNameSync />
      <NotionEditor pageId={pageId} />
    </LiveblocksRoomProvider>
  );
}
