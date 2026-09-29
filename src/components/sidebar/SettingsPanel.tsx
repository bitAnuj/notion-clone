import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Upload,
  X,
  User,
  Shield,
  Palette,
  FolderLock,
  Plus,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import { useUIStore } from "../../store/useUIStore";
import useVaultStore from "../../store/useVaultStore";
import { useAuthStore } from "../../store/useAuthStore";
import { exportAllPages, importAllPages } from "../../lib/backup";
import { getOrCreateCollabUser, updateCollabUserName } from "../../lib/collabUser";

type Tab = "profile" | "vault" | "backup" | "appearance";

function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, theme, toggleTheme } = useUIStore();
  const { pages, setAllPages } = usePageStore();
  const { vaults, currentVaultId, openVault, createVault, renameVault, deleteVault } =
    useVaultStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>("vault");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState(() => getOrCreateCollabUser().name);
  const [newVaultName, setNewVaultName] = useState("");

  if (!settingsOpen) return null;

  const currentVault = vaults.find((v) => v.id === currentVaultId);

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

  const handleCreateNewVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName.trim()) return;
    void createVault(newVaultName.trim());
    setNewVaultName("");
    setMessage("Vault created!");
    setTimeout(() => setMessage(""), 2000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="flex h-[520px] w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl text-zinc-900 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Settings Navigation */}
        <div className="w-48 border-r border-zinc-200 bg-zinc-50 p-3 space-y-1 dark:border-zinc-800 dark:bg-zinc-950/60">
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Preferences
          </p>

          <button
            onClick={() => setActiveTab("vault")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
              activeTab === "vault"
                ? "bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-600/20 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
            }`}
          >
            <FolderLock size={15} />
            Vault Settings
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-600/20 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
            }`}
          >
            <User size={15} />
            Collab Profile
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
              activeTab === "backup"
                ? "bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-600/20 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
            }`}
          >
            <Shield size={15} />
            Backup & Import
          </button>

          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
              activeTab === "appearance"
                ? "bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-600/20 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
            }`}
          >
            <Palette size={15} />
            Appearance
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {activeTab === "vault" && "Vault Management"}
                {activeTab === "profile" && "Collaborator Profile"}
                {activeTab === "backup" && "Backup & Migration"}
                {activeTab === "appearance" && "Appearance & Display"}
              </h2>
              <p className="text-xs text-zinc-500">
                {activeTab === "vault" && "Manage workspaces, switch active vaults, and configure security."}
                {activeTab === "profile" && "Personalize your live presence avatar and cursor tag."}
                {activeTab === "backup" && "Export full workspace JSON snapshots or restore previous states."}
                {activeTab === "appearance" && "Switch themes and interface styling."}
              </p>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X size={18} />
            </button>
          </div>

          <div className="py-4 space-y-4 flex-1">
            {message && (
              <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300">
                {message}
              </div>
            )}

            {/* TAB: VAULT */}
            {activeTab === "vault" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 space-y-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Current Active Vault</p>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{currentVault?.name ?? "Default"}</p>
                    </div>
                    <button
                      onClick={() => {
                        const name = prompt("Rename current vault:", currentVault?.name);
                        if (name && name.trim() && currentVault) {
                          renameVault(currentVault.id, name.trim());
                        }
                      }}
                      className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <Edit2 size={13} /> Rename
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Vault ID: <code className="font-mono text-zinc-600 dark:text-zinc-400">{currentVault?.id}</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    All Vaults ({vaults.length})
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                    {vaults.map((v) => (
                      <div
                        key={v.id}
                        className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                          v.id === currentVaultId
                            ? "bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-800 dark:text-zinc-100"
                            : "hover:bg-zinc-50 text-zinc-600 dark:hover:bg-zinc-800/50 dark:text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {v.id === currentVaultId && <Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
                          <span className="font-medium">{v.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {v.id !== currentVaultId && (
                            <button
                              onClick={() => void openVault(v.id)}
                              className="rounded px-2 py-0.5 text-[11px] text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                              Switch
                            </button>
                          )}
                          {vaults.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete vault "${v.name}" and all its pages permanently?`)) {
                                  deleteVault(v.id);
                                }
                              }}
                              className="rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-zinc-200 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-zinc-700"
                              title="Delete vault"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create New Vault */}
                <form onSubmit={handleCreateNewVault} className="flex gap-2">
                  <input
                    value={newVaultName}
                    onChange={(e) => setNewVaultName(e.target.value)}
                    placeholder="Create a new vault..."
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 outline-none dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    <Plus size={14} /> Create
                  </button>
                </form>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Live Display Name
                  </label>
                  <input
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Your Name"
                    className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    This tag floats over collaborative cursors and presence avatars in both Document & Spreadsheet mode.
                  </p>
                </div>

                {user?.email && (
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <p className="text-xs text-zinc-500">Authenticated Account</p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300">{user.email}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: BACKUP */}
            {activeTab === "backup" && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Export an offline JSON snapshot of all pages in this vault, or restore an earlier backup file.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => exportAllPages(pages)}
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <Download size={15} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Download JSON Backup</span>
                    </div>
                    <span className="text-zinc-500">{pages.length} pages</span>
                  </button>

                  <button
                    onClick={handleImportClick}
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <Upload size={15} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Restore from JSON File</span>
                    </div>
                    <span className="text-zinc-500">Upload .json</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* TAB: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Application Theme</p>
                    <p className="text-xs text-zinc-500">Toggle dark or light theme across VicharHub.</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 shadow-xs"
                  >
                    Current: {theme === "dark" ? "Dark Mode 🌙" : "Light Mode ☀️"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SettingsPanel;
