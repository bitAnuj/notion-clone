import { create } from "zustand";

type UIStore = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  trashOpen: boolean;
  setTrashOpen: (open: boolean) => void;

  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  commandOpen: false,

  setCommandOpen: (open) =>
    set({
      commandOpen: open,
    }),

  trashOpen: false,

  setTrashOpen: (open) =>
    set({
      trashOpen: open,
    }),

  settingsOpen: false,

  setSettingsOpen: (open) =>
    set({
      settingsOpen: open,
    }),
}));
