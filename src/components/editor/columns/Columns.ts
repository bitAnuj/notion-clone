import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columnsBlock: {
      insertColumns: () => ReturnType;
    };
  }
}

export const Column = Node.create({
  name: "column",
  content: "block+",

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "column" }),
      0,
    ];
  },
});

export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column column",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "columns" }),
      0,
    ];
  },

  addCommands() {
    return {
      insertColumns:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: "column",
                content: [{ type: "paragraph" }],
              },
              {
                type: "column",
                content: [{ type: "paragraph" }],
              },
            ],
          }),
    };
  },
});

export default Columns;
