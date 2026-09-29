import { useHotkeys } from "react-hotkeys-hook";

export function useCommandPalette(open: () => void) {
  useHotkeys("ctrl+k", (e) => {
    e.preventDefault();
    open();
  });
}

export function useNewPageShortcut(createNewPage: () => void) {
  useHotkeys(
    "n",
    (e) => {
      // Don't trigger if user is actively typing in an input, textarea or contenteditable editor
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest(".ProseMirror") ||
          target.closest(".jexcel"))
      ) {
        return;
      }
      e.preventDefault();
      createNewPage();
    },
    { enableOnFormTags: false }
  );
}
