import { useRef, useState } from "react";
import { Download, Upload, X } from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";
import { exportAllPages, importAllPages } from "../../lib/backup";

function SettingsPanel() {
  const { settingsOpen, setSettingsOpen } = useUIStore();
  const { pages, setAllPages } = usePageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-20"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="mx-auto w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="rounded p-1 hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Backup
        </p>

        <div className="space-y-2">
          <button
            onClick={() => exportAllPages(pages)}
            className="flex w-full items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            <Download size={16} />
            Export all pages as backup
          </button>

          <button
            onClick={handleImportClick}
            className="flex w-full items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
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
    </div>
  );
}

export default SettingsPanel;
