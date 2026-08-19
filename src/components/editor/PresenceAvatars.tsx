import { useOthers } from "../../lib/liveblocks";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PresenceAvatars() {
  const others = useOthers();

  if (others.length === 0) return null;

  const visible = others.slice(0, 4);
  const overflowCount = others.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((other) => {
        const name = other.info?.name || "Anonymous";
        const color = stringToColor(name);

        return (
          <div
            key={other.connectionId}
            title={name}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-900 text-[10px] font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {getInitials(name)}
          </div>
        );
      })}

      {overflowCount > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-700 text-[10px] font-semibold text-zinc-200">
          +{overflowCount}
        </div>
      )}
    </div>
  );
}

// Turns a name into a consistent color, so the same person always
// gets the same avatar color across sessions.
function stringToColor(name: string): string {
  const colors = [
    "#f87171", "#fb923c", "#facc15", "#4ade80",
    "#60a5fa", "#c084fc", "#f472b6", "#2dd4bf",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default PresenceAvatars;
