import { useRef } from "react";
import { usePageStore } from "../../store/usePageStore";
import IconPicker from "./IconPicker";
import Breadcrumbs from "./Breadcrumbs";
import NotionEditor from "./NotionEditor";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import PageContextMenu from "../ui/PageContextMenu";

function Editor() {
  const {
      pages,
      selectedPageId,
      renamePage,
      updateIcon,
      updateCover,
      addPage,
      toggleFavorite,
      duplicatePage,
      deletePage,
    } = usePageStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const page = pages.find((p) => p.id === selectedPageId);

  if (!page) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-2xl">📄</p>
          <p className="text-zinc-400">No page selected</p>
          <button
            onClick={() => addPage()}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Create a new page
          </button>
        </div>
      );
    }

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
      <div className="mb-2 flex items-center justify-between">
              <Breadcrumbs page={page} />

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <MoreHorizontal size={18} />
                </button>

                {menuOpen && (
                  <PageContextMenu
                    onRename={() => setMenuOpen(false)}
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
            </div>
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

      <div className="mb-6 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
              >
                {page.cover ? "Change Cover" : "Add Cover"}
              </button>

              {page.cover && (
                <button
                  onClick={() => updateCover(page.id, "")}
                  className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400"
                >
                  Remove Cover
                </button>
              )}
            </div>

      <IconPicker icon={page.icon} onSelect={(emoji) => updateIcon(page.id, emoji)} />

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
