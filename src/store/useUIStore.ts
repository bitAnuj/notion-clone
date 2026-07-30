import { create } from "zustand";

type UIStore = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  commandOpen: false,

  setCommandOpen: (open) =>
    set({
      commandOpen: open,
    }),
}));
