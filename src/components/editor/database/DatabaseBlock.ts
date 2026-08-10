import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import DatabaseView from "./DatabaseView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    databaseBlock: {
      insertDatabase: () => ReturnType;
    };
  }
}

export const DatabaseBlock = Node.create({
  name: "databaseBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-items");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          "data-items": JSON.stringify(attributes.items || []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="database"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "database" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DatabaseView);
  },

  addCommands() {
    return {
      insertDatabase:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { items: [] },
          }),
    };
  },
});

export default DatabaseBlock;
