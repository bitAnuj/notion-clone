import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import CommandList, { type CommandListRef } from "./CommandList";
import { filterSlashCommands, type SlashCommandItem } from "./commands";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        command: ({ editor, range, props }) => {
          (props as SlashCommandItem).command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => filterSlashCommands(query),
        render: () => {
          let component: ReactRenderer<CommandListRef>;
          let popup: TippyInstance[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect: () =>
                  props.clientRect!() as DOMRect,
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
                getReferenceClientRect: () =>
                  props.clientRect!() as DOMRect,
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
      }),
    ];
  },
});

export default SlashCommand;
