import { createClient } from "@liveblocks/client";

export const liveblocksClient = createClient({
  throttle: 16,
  authEndpoint: "/api/liveblocks-auth",
});
