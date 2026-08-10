import { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { LayoutGrid, List, Table2 } from "lucide-react";
import { STATUSES, type DatabaseItem, type DatabaseStatus } from "./DatabaseTypes";
import DatabaseTable from "./DatabaseTable";
import DatabaseKanban from "./DatabaseKanban";
import DatabaseGallery from "./DatabaseGallery";

type ViewType = "table" | "kanban" | "gallery";
type SortOrder = "none" | "az" | "za";

// Merges edits made to a filtered/sorted subset back into the full item list,
// so hidden (filtered-out) items are never lost.
function mergeSubsetIntoFull(
  fullItems: DatabaseItem[],
  previousSubset: DatabaseItem[],
  newSubset: DatabaseItem[]
): DatabaseItem[] {
  const previousIds = new Set(previousSubset.map((i) => i.id));
  const newIds = new Set(newSubset.map((i) => i.id));
  const newById = new Map(newSubset.map((i) => [i.id, i]));

  const kept = fullItems
    .filter((item) => !previousIds.has(item.id) || newIds.has(item.id))
    .map((item) => newById.get(item.id) ?? item);

  const existingIds = new Set(fullItems.map((i) => i.id));
  const brandNew = newSubset.filter((i) => !existingIds.has(i.id));

  return [...kept, ...brandNew];
}

function DatabaseView({ node, updateAttributes }: NodeViewProps) {
  const [view, setView] = useState<ViewType>("table");
  const [statusFilter, setStatusFilter] = useState<DatabaseStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const items = (node.attrs.items as DatabaseItem[]) || [];

  const visibleItems = items
    .filter((i) => statusFilter === "all" || i.status === statusFilter)
    .sort((a, b) => {
      if (sortOrder === "az") return a.title.localeCompare(b.title);
      if (sortOrder === "za") return b.title.localeCompare(a.title);
      return 0;
    });

  const onChange = (newSubset: DatabaseItem[]) => {
    updateAttributes({
      items: mergeSubsetIntoFull(items, visibleItems, newSubset),
    });
  };

  return (
    <NodeViewWrapper className="my-2" contentEditable={false}>
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <button
          onClick={() => setView("table")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
            view === "table" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500"
          }`}
        >
          <List size={13} />
          Table
        </button>
        <button
          onClick={() => setView("kanban")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
            view === "kanban" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500"
          }`}
        >
          <Table2 size={13} />
          Kanban
        </button>
        <button
          onClick={() => setView("gallery")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
            view === "gallery" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500"
          }`}
        >
          <LayoutGrid size={13} />
          Gallery
        </button>

        <div className="ml-auto flex items-center gap-1">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DatabaseStatus | "all")
            }
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 outline-none"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 outline-none"
          >
            <option value="none">Unsorted</option>
            <option value="az">Title A → Z</option>
            <option value="za">Title Z → A</option>
          </select>
        </div>
      </div>

      {view === "table" && (
        <DatabaseTable items={visibleItems} onChange={onChange} />
      )}
      {view === "kanban" && (
        <DatabaseKanban items={visibleItems} onChange={onChange} />
      )}
      {view === "gallery" && (
        <DatabaseGallery items={visibleItems} onChange={onChange} />
      )}
    </NodeViewWrapper>
  );
}

export default DatabaseView;
