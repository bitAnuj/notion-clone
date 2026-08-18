import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import MentionList, { type MentionListRef } from "./MentionList";
import type { Page } from "../../../types/page";

export function createPageMention(pagesRef: { current: Page[] }) {
  return Mention.extend({ name: "pageMention" }).configure({
    HTMLAttributes: {
      class:
        "rounded bg-zinc-700 px-1.5 py-0.5 text-blue-300 cursor-pointer",
    },
    suggestion: {
      char: "@",
      items: ({ query }: { query: string }) => {
        const q = query.toLowerCase();
        return pagesRef.current
          .filter((p) => !p.trashed)
          .filter((p) => p.title.toLowerCase().includes(q))
          .slice(0, 8);
      },
      render: () => {
        let component: ReactRenderer<MentionListRef>;
        let popup: TippyInstance[];

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionList, {
              props,
              editor: props.editor,
            });

            if (!props.clientRect) return;

            popup = tippy("body", {
              getReferenceClientRect: () => props.clientRect!() as DOMRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            });
          },
          onUpdate(props) {
            component.updateProps(props);
            if (!props.clientRect) return;
            popup[0]?.setProps({
              getReferenceClientRect: () => props.clientRect!() as DOMRect,
            });
          },
          onKeyDown(props) {
            if (props.event.key === "Escape") {
              popup[0]?.hide();
              return true;
            }
            return component.ref?.onKeyDown(props) ?? false;
          },
          onExit() {
            popup[0]?.destroy();
            component.destroy();
          },
        };
      },
    },
  });
}

export default createPageMention;
