import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";

import { useUIStore } from "../../store/useUIStore";
import { usePageStore } from "../../store/usePageStore";
import PageIcon from "../editor/PageIcon";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ");
}

function CommandMenu() {
  const { commandOpen, setCommandOpen } = useUIStore();

  const { pages, selectPage } = usePageStore();

  if (!commandOpen) return null;

  const visiblePages = pages.filter((page) => !page.trashed);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-20"
      onClick={() => setCommandOpen(false)}
    >
      <Command
        className="mx-auto w-full max-w-xl rounded-xl bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CommandInput placeholder="Search pages and content..." />

        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {visiblePages.map((page) => (
              <CommandItem
                key={page.id}
                value={`${page.title} ${stripHtml(page.content)}`}
                onSelect={() => {
                  selectPage(page.id);
                  setCommandOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 rounded-md px-2 py-1.5"
              >
                <span><PageIcon icon={page.icon} /></span>
                <span>{page.title || "Untitled"}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

export default CommandMenu;
