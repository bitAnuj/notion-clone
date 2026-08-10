import { Search, Bell, Settings } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";

function Navbar() {
  const { setCommandOpen, setSettingsOpen } = useUIStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-6 backdrop-blur-sm">
      <h1 className="text-lg font-semibold tracking-tight">Notion Clone</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Search size={16} />
          Search
          <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
            Ctrl K
          </kbd>
        </button>

        <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
          <Bell size={18} />
        </button>

        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
