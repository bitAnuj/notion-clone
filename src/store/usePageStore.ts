import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Page } from "../types/page";
import { pages as initialPages } from "../data/pages";

type PageStore = {
  pages: Page[];
  selectedPageId: string;

  addPage: () => void;
  deletePage: (id: string) => void;
  renamePage: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
  updateIcon: (id: string, icon: string) => void;
  updateCover: (id: string, cover: string) => void;
  addChildPage: (parentId: string) => void;
  toggleExpanded: (id: string) => void;
  toggleFavorite: (id: string) => void;
  selectPage: (id: string) => void;
};

export const usePageStore = create<PageStore>()(
  persist(
    (set) => ({
      pages: initialPages,

      selectedPageId: initialPages[0]?.id ?? "",

      addPage: () =>
        set((state) => ({
          pages: [
            ...state.pages,
            {
              id: crypto.randomUUID(),
              title: "Untitled",
              content: "",
              icon: "📄",
              cover: "",
              favorite: false,
              parentId: null,
              isExpanded: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),
        addChildPage: (parentId) =>
          set((state) => ({
            pages: [
              ...state.pages,
              {
                id: crypto.randomUUID(),
                title: "Untitled",
                content: "",
                icon: "📄",
                cover: "",
                favorite: false,

                parentId,
                isExpanded: true,

                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          })),

      deletePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((page) => page.id !== id),
          selectedPageId:
            state.selectedPageId === id
              ? state.pages.find((page) => page.id !== id)?.id ?? ""
              : state.selectedPageId,
        })),

      renamePage: (id, title) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? {
                  ...page,
                  title,
                  updatedAt: new Date(),
                }
              : page
          ),
        })),

      updateContent: (id, content) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? {
                  ...page,
                  content,
                  updatedAt: new Date(),
                }
              : page
          ),
        })),

      updateIcon: (id, icon) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? {
                  ...page,
                  icon,
                  updatedAt: new Date(),
                }
              : page
          ),
        })),

      updateCover: (id, cover) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? {
                  ...page,
                  cover,
                  updatedAt: new Date(),
                }
              : page
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? {
                  ...page,
                  favorite: !page.favorite,
                  updatedAt: new Date(),
                }
              : page
          ),
        })),
        toggleExpanded: (id) =>
          set((state) => ({
            pages: state.pages.map((page) =>
              page.id === id
                ? {
                    ...page,
                    isExpanded: !page.isExpanded,
                  }
                : page
            ),
          })),

      selectPage: (id) =>
        set({
          selectedPageId: id,
        }),
    }),
    {
      name: "notion-clone-storage",
    }
  )
);
