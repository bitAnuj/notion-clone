import { useHotkeys } from "react-hotkeys-hook";

export function useCommandPalette(open: () => void) {
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    open();
  });
}
