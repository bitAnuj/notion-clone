import { LiveblocksRoomProvider } from "../../lib/liveblocks";
import SpreadsheetEditor from "./SpreadsheetEditor";

type Props = { pageId: string };

export default function CollaborativeSpreadsheetEditor({ pageId }: Props) {
  // Use a stable, unified room ID for the page so that all users and windows
  // (normal tab, incognito tab, guest) connect to the exact same Liveblocks room
  return (
    <LiveblocksRoomProvider
      id={`page-${pageId}`}
      initialPresence={{}}
    >
      <SpreadsheetEditor pageId={pageId} />
    </LiveblocksRoomProvider>
  );
}
