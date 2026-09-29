import { useRef, useState, useEffect } from "react";
import { Clock, Star, FileText, ArrowRight } from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import PageIcon from "../editor/PageIcon";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ActivityDropdown() {
  const [open, setOpen] = useState(false);
  const { pages, selectPage } = usePageStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const recentPages = [...pages]
    .filter((p) => !p.trashed)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 7);

  const favoritePages = pages.filter((p) => !p.trashed && p.favorite).slice(0, 4);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors ${
          open ? "bg-zinc-800 text-zinc-100" : ""
        }`}
        title="Recent documents & activity"
      >
        <Clock size={17} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[100] w-80 rounded-xl border border-zinc-700/80 bg-zinc-900 p-2 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Jump Back In
            </span>
            <span className="text-[10px] text-zinc-500">Recently edited</span>
          </div>

          {recentPages.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-zinc-500">
              No recent documents found
            </p>
          ) : (
            <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
              {recentPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    selectPage(page.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-zinc-800 transition-colors group"
                >
                  <PageIcon icon={page.icon} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-zinc-200 font-medium group-hover:text-white">
                      {page.title || "Untitled"}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Edited {timeAgo(page.updatedAt)}
                    </p>
                  </div>
                  <ArrowRight
                    size={12}
                    className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          )}

          {favoritePages.length > 0 && (
            <div className="border-t border-zinc-800 pt-1.5 mt-1 px-1">
              <p className="flex items-center gap-1 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-500/80">
                <Star size={10} /> Quick Favorites
              </p>
              <div className="flex flex-wrap gap-1">
                {favoritePages.map((fav) => (
                  <button
                    key={fav.id}
                    onClick={() => {
                      selectPage(fav.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700"
                  >
                    <FileText size={10} className="text-zinc-400" />
                    <span className="max-w-24 truncate">{fav.title || "Untitled"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityDropdown;
