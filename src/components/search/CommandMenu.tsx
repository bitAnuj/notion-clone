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

function CommandMenu() {
  const { commandOpen, setCommandOpen } = useUIStore();

  const { pages, selectPage } = usePageStore();

  if (!commandOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-20"
      onClick={() => setCommandOpen(false)}
    >
      <Command
        className="mx-auto w-full max-w-xl rounded-xl bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CommandInput placeholder="Search pages..." />

        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.id}
                onSelect={() => {
                  selectPage(page.id);
                  setCommandOpen(false);
                }}
              >
                {page.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

export default CommandMenu;
