import type { ReactNode } from "react";

import Navbar from "../components/navbar/Navbar";
import CommandPalette from "../components/modals/CommandPalette";
import Sidebar from "../components/sidebar/Sidebar";

type Props = {
  children: ReactNode;
};

function MainLayout({ children }: Props) {
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
