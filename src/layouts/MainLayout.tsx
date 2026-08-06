import { useEffect, type ReactNode } from "react";

import Navbar from "../components/navbar/Navbar";
import CommandPalette from "../components/modals/CommandPalette";
import Sidebar from "../components/sidebar/Sidebar";
import { usePageStore } from "../store/usePageStore";

type Props = {
  children: ReactNode;
};

function MainLayout({ children }: Props) {
  const { addPage, pages, selectedPageId } = usePageStore();

  useEffect(() => {
      function handleShortcut(e: KeyboardEvent) {
        const target = e.target as HTMLElement;
        const isTyping =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        if (!isTyping && e.key.toLowerCase() === "n") {
          e.preventDefault();
          addPage();
        }
      }

      window.addEventListener("keydown", handleShortcut);
      return () => window.removeEventListener("keydown", handleShortcut);
    }, [addPage]);
  useEffect(() => {
      const currentPage = pages.find((p) => p.id === selectedPageId);
      document.title = currentPage?.title
        ? `${currentPage.title} — Notion Clone`
        : "Notion Clone";
    }, [pages, selectedPageId]);

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      <Navbar />
      <CommandPalette />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
