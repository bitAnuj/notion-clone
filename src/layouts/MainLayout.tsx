import { useEffect, type ReactNode } from "react";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import CommandPalette from "../components/modals/CommandPalette";
import { usePageStore } from "../store/usePageStore";
import { useUIStore } from "../store/useUIStore";

type Props = {
  children: ReactNode;
};

function MainLayout({ children }: Props) {
  const { pages, selectedPageId } = usePageStore();
  const { theme } = useUIStore();

  useEffect(() => {
    const currentPage = pages.find((p) => p.id === selectedPageId);
    document.title = currentPage?.title
      ? `${currentPage.title} — VicharHub`
      : "VicharHub";
  }, [pages, selectedPageId]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  return (
    <div className="flex h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
      <Navbar />
      <CommandPalette />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
