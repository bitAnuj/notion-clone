import { RotateCcw, Trash2, X } from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";
import PageIcon from "../editor/PageIcon";

function TrashPanel() {
  const { trashOpen, setTrashOpen } = useUIStore();
  const { pages, restorePage, permanentlyDeletePage } = usePageStore();

  if (!trashOpen) return null;

  const trashedPages = pages.filter((page) => page.trashed);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 p-4 pt-24 backdrop-blur-[2px]"
      onClick={() => setTrashOpen(false)}
    >
      <div
        className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-100">Trash</h2>
          <div className="flex items-center gap-1">
            {trashedPages.length > 0 && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Permanently delete everything in the trash? This can't be undone."
                    )
                  ) {
                    trashedPages
                      .filter(
                        (p) =>
                          p.parentId === null ||
                          !trashedPages.some((t) => t.id === p.parentId)
                      )
                      .forEach((p) => permanentlyDeletePage(p.id));
                  }
                }}
                className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
              >
                Empty Trash
              </button>
            )}
            <button
              onClick={() => setTrashOpen(false)}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {trashedPages.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-500">
            Trash is empty
          </p>
        )}

        <div className="max-h-96 space-y-0.5 overflow-y-auto p-1.5">
          {trashedPages.map((page) => (
            <div
              key={page.id}
              className="group flex items-center justify-between rounded-md px-2.5 py-2 hover:bg-zinc-800"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm text-zinc-300">
                <PageIcon icon={page.icon} />
                <span className="truncate">
                  {page.title || "Untitled"}
                </span>
              </span>

              <div className="flex shrink-0 items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                <button
                  onClick={() => restorePage(page.id)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                  title="Restore"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => permanentlyDeletePage(page.id)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-red-400"
                  title="Delete forever"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrashPanel;
