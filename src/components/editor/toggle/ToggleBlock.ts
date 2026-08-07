import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ToggleView from "./ToggleView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toggleBlock: {
      insertToggle: () => ReturnType;
    };
  }
}

export const ToggleBlock = Node.create({
  name: "toggleBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-title") || "",
        renderHTML: (attributes) => ({ "data-title": attributes.title }),
      },
      open: {
        default: true,
        parseHTML: (element) => element.getAttribute("data-open") !== "false",
        renderHTML: (attributes) => ({
          "data-open": attributes.open ? "true" : "false",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="toggle"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "toggle" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleView);
  },

  addCommands() {
    return {
      insertToggle:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { title: "", open: true },
            content: [{ type: "paragraph" }],
          }),
    };
  },
});

export default ToggleBlock;
