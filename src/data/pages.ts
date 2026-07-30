import type { Page } from "../types/page";

export const pages: Page[] = [
  {
    id: crypto.randomUUID(),
    title: "Getting Started",
    content: "",
    icon: "📄",
    cover: "",
    favorite: false,

    parentId: null,
    isExpanded: true,

    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
