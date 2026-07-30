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
    <div className="absolute right-0 top-8 z-50 w-52 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
      <button
        onClick={onRename}
        className="flex w-full items-center gap-3 px-4 py-2 hover:bg-zinc-800"
      >
        <Pencil size={16} />
        Rename
      </button>

      <button
        onClick={onDuplicate}
        className="flex w-full items-center gap-3 px-4 py-2 hover:bg-zinc-800"
      >
        <Copy size={16} />
        Duplicate
      </button>

      <button
        onClick={onFavorite}
        className="flex w-full items-center gap-3 px-4 py-2 hover:bg-zinc-800"
      >
        <Star size={16} />
        Favorite
      </button>

      <button
        onClick={onDelete}
        className="flex w-full items-center gap-3 px-4 py-2 text-red-400 hover:bg-zinc-800"
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}

export default PageContextMenu;
