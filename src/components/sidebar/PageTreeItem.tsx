import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import PageIcon from "../editor/PageIcon";
import type { Page } from "../../types/page";
import PageContextMenu from "../ui/PageContextMenu";

type PageTreeItemProps = {
  page: Page;
  depth: number;
};

type DropZone = "before" | "after" | "inside" | null;

function PageTreeItem({ page, depth }: PageTreeItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropZone, setDropZone] = useState<DropZone>(null);

  const {
    pages,
    selectedPageId,
    selectPage,
    toggleExpanded,
    toggleFavorite,
    deletePage,
    duplicatePage,
    addChildPage,
    movePage,
    reorderPage,
  } = usePageStore();

  const children = pages.filter(
    (p) => p.parentId === page.id && !p.trashed
  );
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", page.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const ratio = relativeY / rect.height;

          if (ratio < 0.25) setDropZone("before");
          else if (ratio > 0.75) setDropZone("after");
          else setDropZone("inside");
        }}
        onDragLeave={() => setDropZone(null)}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData("text/plain");

          if (draggedId && draggedId !== page.id) {
            if (dropZone === "before") reorderPage(draggedId, page.id, "before");
            else if (dropZone === "after") reorderPage(draggedId, page.id, "after");
            else movePage(draggedId, page.id);
          }

          setDropZone(null);
        }}
        className={`group relative flex items-center rounded-md ${
          selectedPageId === page.id ? "bg-zinc-800" : "hover:bg-zinc-800"
        } ${dropZone === "inside" ? "outline outline-2 outline-blue-500" : ""} ${
          dropZone === "before" ? "border-t-2 border-blue-500" : ""
        } ${dropZone === "after" ? "border-b-2 border-blue-500" : ""}`}
        style={{ paddingLeft: depth * 14 }}
      >
        <button
          onClick={() => toggleExpanded(page.id)}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-zinc-700 ${
            hasChildren ? "" : "invisible"
          }`}
        >
          {page.isExpanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        <button
          onClick={() => selectPage(page.id)}
          className="flex flex-1 items-center gap-2 py-1.5 pr-1 text-left"
        >
          <span><PageIcon icon={page.icon} /></span>
          <span className="truncate text-sm">{page.title || "Untitled"}</span>
        </button>

        <div className="mr-1 hidden items-center gap-0.5 group-hover:flex">
          <button
            onClick={() => addChildPage(page.id)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            title="Add sub-page"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            title="More options"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {menuOpen && (
          <PageContextMenu
            onRename={() => {
              selectPage(page.id);
              setMenuOpen(false);
            }}
            onDuplicate={() => {
              duplicatePage(page.id);
              setMenuOpen(false);
            }}
            onFavorite={() => {
              toggleFavorite(page.id);
              setMenuOpen(false);
            }}
            onDelete={() => {
              deletePage(page.id);
              setMenuOpen(false);
            }}
          />
        )}
      </div>

      {hasChildren && page.isExpanded && (
        <div>
          {children.map((child) => (
            <PageTreeItem key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PageTreeItem;
