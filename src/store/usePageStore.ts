import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Page } from "../types/page";
import { pages as initialPages } from "../data/pages";

type PageStore = {
  pages: Page[];
  selectedPageId: string;

  addPage: () => void;
  addChildPage: (parentId: string) => void;
  duplicatePage: (id: string) => void;

  deletePage: (id: string) => void;
  restorePage: (id: string) => void;
  permanentlyDeletePage: (id: string) => void;

  renamePage: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
  updateIcon: (id: string, icon: string) => void;
  updateCover: (id: string, cover: string) => void;

  toggleExpanded: (id: string) => void;
    toggleFavorite: (id: string) => void;
  movePage: (id: string, newParentId: string | null) => void;
  setAllPages: (pages: Page[]) => void;
  reorderPage: (
      draggedId: string,
      targetId: string,
      position: "before" | "after"
    ) => void;

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
              trashed: false,
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
              trashed: false,
              parentId,
              isExpanded: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      duplicatePage: (id) =>
        set((state) => {
          const page = state.pages.find((p) => p.id === id);

          if (!page) return state;

          const copy = {
            ...page,
            id: crypto.randomUUID(),
            title: `${page.title} Copy`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            pages: [...state.pages, copy],
          };
        }),

      // Soft delete: marks the page (and all its sub-pages) as trashed,
      // instead of removing them for good. They can be restored later.
      deletePage: (id) =>
        set((state) => {
          const idsToTrash = new Set<string>();
          const collect = (targetId: string) => {
            idsToTrash.add(targetId);
            state.pages
              .filter((page) => page.parentId === targetId)
              .forEach((child) => collect(child.id));
          };
          collect(id);

          const updatedPages = state.pages.map((page) =>
            idsToTrash.has(page.id) ? { ...page, trashed: true } : page
          );

          const visiblePages = updatedPages.filter((p) => !p.trashed);

          return {
            pages: updatedPages,
            selectedPageId: idsToTrash.has(state.selectedPageId)
              ? visiblePages[0]?.id ?? ""
              : state.selectedPageId,
          };
        }),

      // Brings a trashed page (and its sub-pages) back.
      restorePage: (id) =>
        set((state) => {
          const idsToRestore = new Set<string>();
          const collect = (targetId: string) => {
            idsToRestore.add(targetId);
            state.pages
              .filter((page) => page.parentId === targetId)
              .forEach((child) => collect(child.id));
          };
          collect(id);

          return {
            pages: state.pages.map((page) =>
              idsToRestore.has(page.id) ? { ...page, trashed: false } : page
            ),
          };
        }),

      // Actually removes a trashed page (and its sub-pages) for good.
      permanentlyDeletePage: (id) =>
        set((state) => {
          const idsToDelete = new Set<string>();
          const collect = (targetId: string) => {
            idsToDelete.add(targetId);
            state.pages
              .filter((page) => page.parentId === targetId)
              .forEach((child) => collect(child.id));
          };
          collect(id);

          return {
            pages: state.pages.filter((page) => !idsToDelete.has(page.id)),
          };
        }),

      renamePage: (id, title) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, title, updatedAt: new Date() }
              : page
          ),
        })),

      updateContent: (id, content) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, content, updatedAt: new Date() }
              : page
          ),
        })),

      updateIcon: (id, icon) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, icon, updatedAt: new Date() }
              : page
          ),
        })),

      updateCover: (id, cover) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, cover, updatedAt: new Date() }
              : page
          ),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, favorite: !page.favorite, updatedAt: new Date() }
              : page
          ),
        })),

      toggleExpanded: (id) =>
        set((state) => ({
          pages: state.pages.map((page) =>
            page.id === id
              ? { ...page, isExpanded: !page.isExpanded }
              : page
          ),
        })),
        movePage: (id, newParentId) =>
                set((state) => {
                  // Prevent dropping a page onto itself or one of its own children
                  const isDescendant = (
                    candidateId: string,
                    ancestorId: string
                  ): boolean => {
                    const candidate = state.pages.find((p) => p.id === candidateId);
                    if (!candidate || candidate.parentId === null) return false;
                    if (candidate.parentId === ancestorId) return true;
                    return isDescendant(candidate.parentId, ancestorId);
                  };

                  if (newParentId === id) return state;
                  if (newParentId && isDescendant(newParentId, id)) return state;

                  return {
                    pages: state.pages.map((page) =>
                      page.id === id
                        ? { ...page, parentId: newParentId, isExpanded: true }
                        : page
                    ),
                  };
                }),
      setAllPages: (pages) =>
                        set({
                          pages,
                          selectedPageId: pages[0]?.id ?? "",
                        }),
                        reorderPage: (draggedId, targetId, position) =>
                                set((state) => {
                                  const dragged = state.pages.find((p) => p.id === draggedId);
                                  const target = state.pages.find((p) => p.id === targetId);

                                  if (!dragged || !target || dragged.id === target.id) return state;

                                  // Move the dragged page to the same parent as the target
                                  const withoutDragged = state.pages.filter(
                                    (p) => p.id !== draggedId
                                  );
                                  const updatedDragged = { ...dragged, parentId: target.parentId };

                                  const targetIndex = withoutDragged.findIndex(
                                    (p) => p.id === targetId
                                  );
                                  const insertIndex =
                                    position === "before" ? targetIndex : targetIndex + 1;

                                  const newPages = [...withoutDragged];
                                  newPages.splice(insertIndex, 0, updatedDragged);

                                  return { pages: newPages };
                                }),

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
