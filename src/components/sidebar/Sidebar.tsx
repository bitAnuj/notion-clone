import { Home, Plus, Search, Settings, Star, Trash2 } from "lucide-react";

import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";
import PageTreeItem from "./PageTreeItem";
import TrashPanel from "./TrashPanel";
import SettingsPanel from "./SettingsPanel";

function Sidebar() {
  const { pages, addPage, selectPage } = usePageStore();
  const { setCommandOpen, setTrashOpen, setSettingsOpen } = useUIStore();

  const visiblePages = pages.filter((page) => !page.trashed);
  const favoritePages = visiblePages.filter((page) => page.favorite);
  const rootPages = visiblePages.filter((page) => page.parentId === null);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="space-y-0.5 p-2">
        <button
          onClick={() => rootPages[0] && selectPage(rootPages[0].id)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Home size={16} className="text-zinc-500" />
          Home
        </button>

        <button
          onClick={() => setCommandOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Search size={16} className="text-zinc-500" />
          Search
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Settings size={16} className="text-zinc-500" />
          Settings
        </button>

        <button
          onClick={() => setTrashOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Trash2 size={16} className="text-zinc-500" />
          Trash
        </button>
      </div>

      <div className="mx-2 border-t border-zinc-800" />

      <div className="p-2">
        <button
          onClick={() => addPage()}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Plus size={16} className="text-zinc-500" />
          New Page
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {favoritePages.length > 0 && (
          <>
            <p className="mb-1 mt-2 flex items-center gap-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              <Star size={11} />
              Favorites
            </p>
            {favoritePages.map((page) => (
              <PageTreeItem key={page.id} page={page} depth={0} />
            ))}
          </>
        )}

        <p className="mb-1 mt-3 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
          Pages
        </p>

        {rootPages.length === 0 && (
          <p className="px-2.5 py-2 text-xs text-zinc-600">
            No pages yet
          </p>
        )}

        {rootPages.map((page) => (
          <PageTreeItem key={page.id} page={page} depth={0} />
        ))}
      </div>

      <TrashPanel />
      <SettingsPanel />
    </aside>
  );
}

export default Sidebar;
