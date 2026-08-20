import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
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
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedIndex(0);
      if (buttonRefs.current[0]) {
        buttonRefs.current[0]?.focus();
      }
    }, [items]);

    // Scroll selected item into view
    useEffect(() => {
      if (buttonRefs.current[selectedIndex]) {
        buttonRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
      }
    }, [selectedIndex]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
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
      <div ref={listRef} className="max-h-80 w-72 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl" role="listbox">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.title}
              ref={(el) => { buttonRefs.current[index] = el; }}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors ${
                isSelected ? "bg-blue-600 text-white" : "hover:bg-zinc-800"
              }`}
              role="option"
              aria-selected={isSelected}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                isSelected ? "border-blue-500 bg-blue-700" : "border-zinc-700 bg-zinc-800"
              }`}>
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {item.title}
                </span>
                <span className="block truncate text-xs">
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
