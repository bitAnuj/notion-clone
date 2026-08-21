import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { fetchLinkMetadata } from "../../lib/linkUnfurl";

export const LinkUnfurl = Extension.create({
  name: "linkUnfurl",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData("text/plain")?.trim();
            if (!text) return false;

            const urlRegex = /^https?:\/\/\S+$/;
            if (!urlRegex.test(text)) return false;

            // Insert the link immediately and safely, using the link
            // MARK (not a node — Link is a mark in this schema). We
            // don't wait on the metadata fetch to do this, since in a
            // live collaborative document, waiting on an async fetch
            // before inserting risks the cursor position becoming stale
            // if anyone (including you) types in the meantime.
            const { state, dispatch } = view;
            const { schema, selection } = state;
            const linkMark = schema.marks.link;

            if (!linkMark) return false;

            const textNode = schema.text(text, [
              linkMark.create({ href: text }),
            ]);

            dispatch(
              state.tr.replaceWith(selection.from, selection.to, textNode)
            );

            // Separately, fetch metadata in the background purely to
            // warm the cache — this makes the hover preview available
            // once it resolves, without touching the document at all.
            fetchLinkMetadata(text);

            return true;
          },
        },
      }),
    ];
  },
});

export default LinkUnfurl;
