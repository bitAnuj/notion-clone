import { useEffect } from "react";
import CommandMenu from "../search/CommandMenu";
import { useUIStore } from "../../store/useUIStore";

function CommandPalette() {
  const { setCommandOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  return <CommandMenu />;
}

export default CommandPalette;
