import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  throttle: 16,
  authEndpoint: "/api/liveblocks-auth",
});

type Presence = {
  cursor?: { x: number; y: number };
  selection?: { anchor: number; head: number };
};

type Storage = Record<string, never>;
type UserMeta = { id: string; info: { name: string } };
type RoomEvent = never;
type ThreadMetadata = { resolved: boolean };

export const {
  RoomProvider: LiveblocksRoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useOthersMapped,
  useOthersConnectionIds,
  useOther,
  useBroadcastEvent,
  useEventListener,
  useStorage,
  useMutation,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);

export { client };
