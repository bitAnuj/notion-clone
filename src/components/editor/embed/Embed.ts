import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import EmbedView from "./EmbedView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embedBlock: {
      setEmbed: (url: string) => ReturnType;
    };
  }
}

export const EmbedBlock = Node.create({
  name: "embedBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-url") || "",
        renderHTML: (attributes) => ({ "data-url": attributes.url }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "embed" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedView);
  },

  addCommands() {
    return {
      setEmbed:
        (url: string) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { url },
          }),
    };
  },
});

export default EmbedBlock;
