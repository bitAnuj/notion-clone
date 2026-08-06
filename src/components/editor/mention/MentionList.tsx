import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import type { Page } from "../../../types/page";

type MentionListProps = {
  items: Page[];
  command: (item: { id: string; label: string }) => void;
};

export type MentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const page = items[index];
      if (page) {
        command({ id: page.id, label: page.title || "Untitled" });
      }
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
        <div className="w-64 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-500 shadow-xl">
          No pages found
        </div>
      );
    }

    return (
      <div className="max-h-72 w-64 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
        {items.map((page, index) => (
          <button
            key={page.id}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
              index === selectedIndex ? "bg-zinc-800" : ""
            }`}
          >
            <span>{page.icon || "📄"}</span>
            <span className="truncate">{page.title || "Untitled"}</span>
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = "MentionList";

export default MentionList;
