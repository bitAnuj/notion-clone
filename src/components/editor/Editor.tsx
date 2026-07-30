import { useRef } from "react";
import { usePageStore } from "../../store/usePageStore";
import NotionEditor from "./NotionEditor";

function Editor() {
  const {
    pages,
    selectedPageId,
    renamePage,
    updateIcon,
    updateCover,
  } = usePageStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const page = pages.find((p) => p.id === selectedPageId);

  if (!page) return null;

  const handleCoverUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    updateCover(page.id, imageUrl);
  };

  return (
    <div className="mx-auto max-w-4xl p-16">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />

      {page.cover && (
        <img
          src={page.cover}
          alt="Cover"
          className="mb-6 h-56 w-full rounded-xl object-cover"
        />
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        className="mb-6 rounded-md border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
      >
        {page.cover ? "Change Cover" : "Add Cover"}
      </button>

      <input
        type="text"
        value={page.icon || "📄"}
        onChange={(e) => updateIcon(page.id, e.target.value)}
        className="mb-4 w-20 bg-transparent text-6xl outline-none"
      />

      <p className="mb-2 text-sm text-zinc-500">
        Last updated: {new Date(page.updatedAt).toLocaleString()}
      </p>

      <input
        value={page.title}
        onChange={(e) => renamePage(page.id, e.target.value)}
        placeholder="Untitled"
        className="mb-8 w-full bg-transparent text-5xl font-bold outline-none"
      />

      <NotionEditor />
    </div>
  );
}

export default Editor;
