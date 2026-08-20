import { useRef, useState, useEffect } from "react";
import { Bell } from "lucide-react";
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

  // Custom click outside that ignores scroll
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
    .slice(0, 8);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <Bell size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[100] w-72 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          <p className="border-b border-zinc-800 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Recent activity
          </p>

          {recentPages.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-zinc-500">
              Nothing yet
            </p>
          )}

          <div className="max-h-80 overflow-y-auto p-1.5">
            {recentPages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  selectPage(page.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-zinc-800"
              >
                <PageIcon icon={page.icon} />
                <span className="min-w-0 flex-1 truncate text-zinc-300">
                  {page.title || "Untitled"}
                </span>
                <span className="shrink-0 text-xs text-zinc-600">
                  {timeAgo(page.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityDropdown;
