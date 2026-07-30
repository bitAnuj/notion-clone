import { Search, Bell, Settings } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";

function Navbar() {
  const { setCommandOpen } = useUIStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6">
      <h1 className="text-lg font-semibold">Notion Clone</h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
        >
          <Search size={16} />
          Search
          <kbd className="rounded bg-zinc-800 px-2 py-1 text-xs">
            Ctrl K
          </kbd>
        </button>

        <Bell size={20} className="cursor-pointer" />
        <Settings size={20} className="cursor-pointer" />
      </div>
    </header>
  );
}

export default Navbar;
