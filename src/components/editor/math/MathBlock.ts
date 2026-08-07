import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MathView from "./MathView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      insertMath: () => ReturnType;
    };
  }
}

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-latex") || "",
        renderHTML: (attributes) => ({ "data-latex": attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "math" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathView);
  },

  addCommands() {
    return {
      insertMath:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { latex: "" },
          }),
    };
  },
});

export default MathBlock;
