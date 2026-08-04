import { useEffect } from "react";
import CommandMenu from "../search/CommandMenu";
import { useUIStore } from "../../store/useUIStore";
import { usePageStore } from "../../store/usePageStore";

function CommandPalette() {
  const { setCommandOpen } = useUIStore();
  const { addPage } = usePageStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addPage();
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen, addPage]);

  return <CommandMenu />;
}

export default CommandPalette;
