import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import type { SlashCommandItem } from "./commands";

type CommandListProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
};

export type CommandListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-72 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-500 shadow-xl">
          No results
        </div>
      );
    }

    return (
      <div className="max-h-80 w-72 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left ${
                index === selectedIndex ? "bg-zinc-800" : ""
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800">
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-zinc-100">
                  {item.title}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
);

CommandList.displayName = "CommandList";

export default CommandList;
