import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { getOrCreateCollabUser } from "./collabUser";
import { useAuthStore } from "../store/useAuthStore";

const client = createClient({
  throttle: 16,
  authEndpoint: async (room) => {
    const authUser = useAuthStore.getState().user;
    const localUser = getOrCreateCollabUser();
    const effectiveName = authUser?.name?.trim() || localUser.name || "Guest";
    const effectiveId = authUser?.id || localUser.id;
    const effectiveColor = localUser.color || "#4f46e5";

    const accessToken = localStorage.getItem("vh_access_token") ?? "";
    const response = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        room,
        userId: effectiveId,
        userName: effectiveName,
        userColor: effectiveColor,
      }),
    });
    return response.json();
  },
});

type Presence = {
  cursor?: { x: number; y: number };
  selection?: { anchor: number; head: number };
  displayName?: string;
  user?: { name?: string; color?: string };
  liveblocksTiptap?: {
    user?: { name?: string; color?: string };
  };
};

type Storage = Record<string, never>;
type UserMeta = { id: string; info: { name: string; color?: string } };

export type RoomEvent =
  | {
      type: "SHEET_CELL_CHANGE";
      sheetIndex?: number;
      x: number;
      y: number;
      value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    };

type ThreadMetadata = { resolved: boolean };

export const {
  RoomProvider: LiveblocksRoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);
