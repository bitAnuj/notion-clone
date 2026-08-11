import { Plus, Trash2 } from "lucide-react";
import { STATUS_COLORS, type DatabaseItem } from "./DatabaseTypes";

type DatabaseGalleryProps = {
  items: DatabaseItem[];
  onChange: (items: DatabaseItem[]) => void;
};

function DatabaseGallery({ items, onChange }: DatabaseGalleryProps) {
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group rounded-lg border border-zinc-700 bg-zinc-800 p-3"
        >
          <div className="mb-2 flex items-start justify-between">
            <span
              className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[item.status]}`}
            >
              {item.status}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              className="block rounded p-0.5 text-zinc-500 hover:text-red-400 md:hidden md:group-hover:block"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <input
            value={item.title}
            onChange={(e) => updateItem(item.id, { title: e.target.value })}
            placeholder="Untitled"
            className="w-full bg-transparent text-sm font-medium outline-none"
          />
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex min-h-[80px] items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500 hover:bg-zinc-800"
      >
        <Plus size={14} />
        New
      </button>
    </div>
  );
}

export default DatabaseGallery;
