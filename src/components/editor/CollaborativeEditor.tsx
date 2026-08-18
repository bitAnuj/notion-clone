import { LiveblocksRoomProvider } from "../../lib/liveblocks";
import NotionEditor from "./NotionEditor";

type Props = {
  pageId: string;
};

export default function CollaborativeEditor({ pageId }: Props) {
  return (
    <LiveblocksRoomProvider id={`page-${pageId}`} initialPresence={{}}>
      <NotionEditor pageId={pageId} />
    </LiveblocksRoomProvider>
  );
}
