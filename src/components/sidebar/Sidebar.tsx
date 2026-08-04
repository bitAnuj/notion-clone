import { Home, Plus, Search, Settings, Star, Trash2 } from "lucide-react";

import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";
import PageTreeItem from "./PageTreeItem";
import TrashPanel from "./TrashPanel";

function Sidebar() {
  const { pages, addPage, selectPage } = usePageStore();
  const { setCommandOpen, setTrashOpen } = useUIStore();

  const visiblePages = pages.filter((page) => !page.trashed);
  const favoritePages = visiblePages.filter((page) => page.favorite);
  const rootPages = visiblePages.filter((page) => page.parentId === null);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="space-y-1 p-3">
        <button
          onClick={() => rootPages[0] && selectPage(rootPages[0].id)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-800"
        >
          <Home size={18} />
          Home
        </button>

        <button
          onClick={() => setCommandOpen(true)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-800"
        >
          <Search size={18} />
          Search
        </button>

        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-800">
          <Settings size={18} />
          Settings
        </button>

        <button
          onClick={() => setTrashOpen(true)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-800"
        >
          <Trash2 size={18} />
          Trash
        </button>
      </div>

      <div className="px-3">
        <button
          onClick={() => addPage()}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-800"
        >
          <Plus size={18} />
          New Page
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-2">
        {favoritePages.length > 0 && (
          <>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Star size={12} className="mr-1 inline" />
              Favorites
            </p>
            {favoritePages.map((page) => (
              <PageTreeItem key={page.id} page={page} depth={0} />
            ))}
          </>
        )}

        <p className="mb-2 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Pages
        </p>

        {rootPages.map((page) => (
          <PageTreeItem key={page.id} page={page} depth={0} />
        ))}
      </div>

      <TrashPanel />
    </aside>
  );
}

export default Sidebar;
