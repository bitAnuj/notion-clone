import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { fetchLinkMetadata, getFavicon } from "../../lib/linkUnfurl";

export const LinkUnfurl = Extension.create({
  name: "linkUnfurl",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            console.log("LinkUnfurl handlePaste called");
            const text = event.clipboardData?.getData("text/plain")?.trim();
            console.log("Pasted text:", text);
            if (!text) return false;

            // Check if pasted content is a URL
            const urlRegex = /^https?:\/\/\S+$/;
            const isUrl = urlRegex.test(text);
            console.log("Is URL:", isUrl);
            if (!isUrl) return false;

            console.log("Detected URL, fetching metadata...");

            // Fetch metadata async
            fetchLinkMetadata(text).then((metadata) => {
              console.log("Metadata fetched:", metadata);
              if (!metadata) return;

              const { state, dispatch } = view;
              const { selection } = state;

              // Insert link with metadata
              dispatch(
                state.tr.replaceWith(selection.from, selection.to,
                  state.schema.nodes.link.create({
                    href: text,
                    title: metadata.title,
                    "data-description": metadata.description,
                    "data-image": metadata.image || "",
                    "data-favicon": getFavicon(text),
                  })
                )
              );
            });

            return true; // Prevent default paste
          },
        },
      }),
    ];
  },
});

export default LinkUnfurl;
