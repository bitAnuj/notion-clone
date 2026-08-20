import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Upload, X } from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";
import { exportAllPages, importAllPages } from "../../lib/backup";
import { getOrCreateCollabUser, updateCollabUserName } from "../../lib/collabUser";

function SettingsPanel() {
  const { settingsOpen, setSettingsOpen } = useUIStore();
  const { pages, setAllPages } = usePageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState(() => getOrCreateCollabUser().name);

  if (!settingsOpen) return null;

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importAllPages(
      file,
      (importedPages) => {
        setAllPages(importedPages);
        setMessage("Backup restored successfully!");
      },
      (error) => setMessage(error)
    );

    e.target.value = "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    updateCollabUserName(value || "Anonymous");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/40 p-20"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="mx-auto w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="rounded p-1 hover:bg-zinc-800 text-zinc-400"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Your name
        </p>
        <input
          value={name}
          onChange={handleNameChange}
          placeholder="Anonymous"
          className="mb-4 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 placeholder:text-zinc-600"
        />
        <p className="mb-4 text-xs text-zinc-500">
          This is what other people see next to your cursor and avatar
          while you're editing together.
        </p>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Backup
        </p>

        <div className="space-y-2">
          <button
            onClick={() => exportAllPages(pages)}
            className="flex w-full items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            <Download size={16} />
            Export all pages as backup
          </button>

          <button
            onClick={handleImportClick}
            className="flex w-full items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            <Upload size={16} />
            Restore from backup file
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {message && (
          <p className="mt-3 text-xs text-zinc-400">{message}</p>
        )}
      </div>
    </div>,
    document.body
  );
}

export default SettingsPanel;
