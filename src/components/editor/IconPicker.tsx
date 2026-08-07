import { useEffect, useRef, useState } from "react";
import { ICON_LIBRARY, EMOJI_LIBRARY } from "../../lib/iconLibrary";
import PageIcon from "./PageIcon";

type IconPickerProps = {
  icon: string;
  onSelect: (icon: string) => void;
};

function IconPicker({ icon, onSelect }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"emoji" | "icons">("emoji");
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const q = query.toLowerCase();

  const filteredEmojis = EMOJI_LIBRARY.filter(
    (e) => !q || e.keywords.some((k) => k.includes(q))
  );

  const filteredIcons = ICON_LIBRARY.filter(
    (i) =>
      !q ||
      i.name.toLowerCase().includes(q) ||
      i.keywords.some((k) => k.includes(q))
  );

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-lg text-6xl hover:bg-zinc-800"
      >
        <PageIcon icon={icon} size={56} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          <div className="border-b border-zinc-700 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search emoji or icons (try 'github')..."
              className="w-full rounded-md bg-zinc-800 px-2 py-1.5 text-sm outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="flex border-b border-zinc-700">
            <button
              onClick={() => setTab("emoji")}
              className={`flex-1 py-1.5 text-xs font-medium ${
                tab === "emoji"
                  ? "border-b-2 border-blue-500 text-zinc-100"
                  : "text-zinc-500"
              }`}
            >
              Emoji
            </button>
            <button
              onClick={() => setTab("icons")}
              className={`flex-1 py-1.5 text-xs font-medium ${
                tab === "icons"
                  ? "border-b-2 border-blue-500 text-zinc-100"
                  : "text-zinc-500"
              }`}
            >
              Icons
            </button>
          </div>

          <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto p-2">
            {tab === "emoji" &&
              (filteredEmojis.length === 0 ? (
                <p className="col-span-8 py-4 text-center text-xs text-zinc-500">
                  No emoji found
                </p>
              ) : (
                filteredEmojis.map((e) => (
                  <button
                    key={e.char}
                    onClick={() => {
                      onSelect(e.char);
                      setOpen(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded text-lg hover:bg-zinc-800"
                  >
                    {e.char}
                  </button>
                ))
              ))}

            {tab === "icons" &&
              (filteredIcons.length === 0 ? (
                <p className="col-span-8 py-4 text-center text-xs text-zinc-500">
                  No icons found
                </p>
              ) : (
                filteredIcons.map(({ name, Icon }) => (
                  <button
                    key={name}
                    onClick={() => {
                      onSelect(`lucide:${name}`);
                      setOpen(false);
                    }}
                    title={name}
                    className="flex h-8 w-8 items-center justify-center rounded text-zinc-300 hover:bg-zinc-800"
                  >
                    <Icon size={16} />
                  </button>
                ))
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default IconPicker;
