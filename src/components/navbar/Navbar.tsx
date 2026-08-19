import { Search, Settings, Menu, Sun, Moon } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";
import ActivityDropdown from "./ActivityDropdown";

function Navbar() {
  const { setCommandOpen, setSettingsOpen, setSidebarOpen, theme, toggleTheme } =
    useUIStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Notion Clone</h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 p-2 text-sm text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 sm:px-3 sm:py-1.5"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500 sm:inline">
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <ActivityDropdown />

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
