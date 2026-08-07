import { Plus, Trash2 } from "lucide-react";
import { STATUSES, STATUS_COLORS, type DatabaseItem } from "./DatabaseTypes";

type DatabaseTableProps = {
  items: DatabaseItem[];
  onChange: (items: DatabaseItem[]) => void;
};

function DatabaseTable({ items, onChange }: DatabaseTableProps) {
  const addItem = () => {
    onChange([
      ...items,
      { id: crypto.randomUUID(), title: "", status: "Not Started" },
    ]);
  };

  const updateItem = (id: string, changes: Partial<DatabaseItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700 bg-zinc-800 text-left text-zinc-400">
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="w-40 px-3 py-2 font-medium">Status</th>
            <th className="w-10 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-800 last:border-0">
              <td className="px-3 py-1.5">
                <input
                  value={item.title}
                  onChange={(e) =>
                    updateItem(item.id, { title: e.target.value })
                  }
                  placeholder="Untitled"
                  className="w-full bg-transparent outline-none"
                />
              </td>
              <td className="px-3 py-1.5">
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateItem(item.id, {
                      status: e.target.value as DatabaseItem["status"],
                    })
                  }
                  className={`rounded px-2 py-0.5 text-xs outline-none ${STATUS_COLORS[item.status]}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-zinc-900 text-zinc-100">
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-1.5 text-right">
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addItem}
        className="flex w-full items-center gap-1.5 border-t border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
      >
        <Plus size={14} />
        New
      </button>
    </div>
  );
}

export default DatabaseTable;
