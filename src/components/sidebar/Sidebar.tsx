import {
  FileText,
  Home,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react";

import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";

function Sidebar() {
  const {
    pages,
    addPage,
    deletePage,
    selectedPageId,
    selectPage,
    toggleFavorite,
  } = usePageStore();

  const { setCommandOpen } = useUIStore();

  const favoritePages = pages.filter((page) => page.favorite);
  const otherPages = pages.filter((page) => !page.favorite);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="space-y-1 p-3">
        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-zinc-800">
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
      </div>

      <div className="px-3">
        <button
          onClick={addPage}
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
              Favorites
            </p>

            {favoritePages.map((page) => (
              <div
                key={page.id}
                className={`group mb-1 flex items-center justify-between rounded-md ${
                  selectedPageId === page.id
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800"
                }`}
              >
                <button
                  onClick={() => selectPage(page.id)}
                  className="flex flex-1 items-center gap-2 px-3 py-2 text-left"
                >
                  <span>{page.icon || "📄"}</span>
                  <span className="truncate">{page.title}</span>
                </button>

                <button
                  onClick={() => toggleFavorite(page.id)}
                  className="p-1 text-yellow-400"
                >
                  <Star size={16} fill="currentColor" />
                </button>
              </div>
            ))}
          </>
        )}

        <p className="mb-2 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Pages
        </p>

        {otherPages.map((page) => (
          <div
            key={page.id}
            className={`group mb-1 flex items-center justify-between rounded-md ${
              selectedPageId === page.id
                ? "bg-zinc-800"
                : "hover:bg-zinc-800"
            }`}
          >
            <button
              onClick={() => selectPage(page.id)}
              className="flex flex-1 items-center gap-2 px-3 py-2 text-left"
            >
              <span>{page.icon || "📄"}</span>
              <span className="truncate">{page.title}</span>
            </button>

            <div className="mr-2 hidden items-center gap-1 group-hover:flex">
              <button
                onClick={() => toggleFavorite(page.id)}
                className="text-zinc-400 hover:text-yellow-400"
              >
                <Star size={16} />
              </button>

              <button
                onClick={() => deletePage(page.id)}
                className="text-zinc-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
