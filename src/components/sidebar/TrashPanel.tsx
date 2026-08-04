import { RotateCcw, Trash2, X } from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";

function TrashPanel() {
  const { trashOpen, setTrashOpen } = useUIStore();
  const { pages, restorePage, permanentlyDeletePage } = usePageStore();

  if (!trashOpen) return null;

  const trashedPages = pages.filter((page) => page.trashed);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-20"
      onClick={() => setTrashOpen(false)}
    >
      <div
        className="mx-auto w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Trash</h2>
          <button
            onClick={() => setTrashOpen(false)}
            className="rounded p-1 hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {trashedPages.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">
            Trash is empty
          </p>
        )}

        <div className="max-h-96 space-y-1 overflow-y-auto">
          {trashedPages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-zinc-800"
            >
              <span className="flex items-center gap-2 truncate">
                <span>{page.icon || "📄"}</span>
                <span className="truncate text-sm">
                  {page.title || "Untitled"}
                </span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => restorePage(page.id)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                  title="Restore"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => permanentlyDeletePage(page.id)}
                  className="rounded p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-red-500"
                  title="Delete forever"
                >
                  <Trash2 size={16} />
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
