import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FileView from "./FileView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileBlock: {
      setFile: (attrs: {
        name: string;
        size: number;
        dataUrl: string;
      }) => ReturnType;
    };
  }
}

export const FileBlock = Node.create({
  name: "fileBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      name: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-name") || "",
        renderHTML: (attributes) => ({ "data-name": attributes.name }),
      },
      size: {
        default: 0,
        parseHTML: (element) =>
          Number(element.getAttribute("data-size")) || 0,
        renderHTML: (attributes) => ({ "data-size": attributes.size }),
      },
      dataUrl: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-url") || "",
        renderHTML: (attributes) => ({ "data-url": attributes.dataUrl }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="file"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "file" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileView);
  },

  addCommands() {
    return {
      setFile:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs,
          }),
    };
  },
});

export default FileBlock;
