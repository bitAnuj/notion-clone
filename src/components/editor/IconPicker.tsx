import { useEffect, useRef, useState } from "react";

const EMOJIS = [
  "📄","📝","📌","📎","📁","📂","🗂️","📋","📅","📊",
  "💡","🔥","⭐","✅","🎯","🚀","🎨","🎧","🎬","📚",
  "🧠","💻","🛠️","🔧","🔍","📈","📉","🗒️","🧩","🎓",
  "🏠","🌍","🌱","☕","🍕","🎮","💰","⚙️","🔔","❤️",
];

type IconPickerProps = {
  icon: string;
  onSelect: (emoji: string) => void;
};

function IconPicker({ icon, onSelect }: IconPickerProps) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-lg text-6xl hover:bg-zinc-800"
      >
        {icon || "📄"}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 grid w-64 grid-cols-8 gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => {
                onSelect(e);
                setOpen(false);
              }}
              className="flex h-7 w-7 items-center justify-center rounded text-lg hover:bg-zinc-800"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default IconPicker;
