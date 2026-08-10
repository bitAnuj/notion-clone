import {
  Copy,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

type Props = {
  onRename: () => void;
  onDuplicate: () => void;
  onFavorite: () => void;
  onDelete: () => void;
};

function PageContextMenu({
  onRename,
  onDuplicate,
  onFavorite,
  onDelete,
}: Props) {
  return (
    <div className="absolute right-0 top-9 z-50 w-48 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
      <button
        onClick={onRename}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <Pencil size={14} className="text-zinc-500" />
        Rename
      </button>

      <button
        onClick={onDuplicate}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <Copy size={14} className="text-zinc-500" />
        Duplicate
      </button>

      <button
        onClick={onFavorite}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <Star size={14} className="text-zinc-500" />
        Favorite
      </button>

      <div className="my-1 border-t border-zinc-800" />

      <button
        onClick={onDelete}
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-red-400 hover:bg-red-950/40"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}

export default PageContextMenu;
