import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { STATUSES, type DatabaseItem, type DatabaseStatus } from "./DatabaseTypes";

type DatabaseKanbanProps = {
  items: DatabaseItem[];
  onChange: (items: DatabaseItem[]) => void;
};

function DatabaseKanban({ items, onChange }: DatabaseKanbanProps) {
  const [dragOverStatus, setDragOverStatus] = useState<DatabaseStatus | null>(
    null
  );

  const updateItem = (id: string, changes: Partial<DatabaseItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const addItem = (status: DatabaseStatus) => {
    onChange([...items, { id: crypto.randomUUID(), title: "", status }]);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {STATUSES.map((status) => (
        <div
          key={status}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStatus(status);
          }}
          onDragLeave={() => setDragOverStatus(null)}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            if (id) updateItem(id, { status });
            setDragOverStatus(null);
          }}
          className={`rounded-lg border p-2 ${
            dragOverStatus === status
              ? "border-blue-500 bg-blue-950/20"
              : "border-zinc-700 bg-zinc-900"
          }`}
        >
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {status}
          </p>

          <div className="space-y-2">
            {items
              .filter((i) => i.status === status)
              .map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", item.id)
                  }
                  className="group flex items-start gap-1 rounded-md border border-zinc-700 bg-zinc-800 p-2 text-sm"
                >
                  <input
                    value={item.title}
                    onChange={(e) =>
                      updateItem(item.id, { title: e.target.value })
                    }
                    placeholder="Untitled"
                    className="flex-1 bg-transparent outline-none"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="block rounded p-0.5 text-zinc-500 hover:text-red-400 md:hidden md:group-hover:block"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>

          <button
            onClick={() => addItem(status)}
            className="mt-2 flex w-full items-center gap-1 rounded-md px-1 py-1 text-xs text-zinc-500 hover:bg-zinc-800"
          >
            <Plus size={13} />
            New
          </button>
        </div>
      ))}
    </div>
  );
}

export default DatabaseKanban;
