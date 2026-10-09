const STORAGE_KEY = "vicharhub-collab-user";

export const COLLAB_NAME_CHANGE_EVENT = "vicharhub-collab-name-change";

export type CollabUser = {
  id: string;
  name: string;
  color: string;
};

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFBE0B,", "#FB5607",
  "#8338EC", "#3A86FF", "#06D6A0", "#118AB2", "#EF476F",
];


function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}


function isLegacyName(name: string): boolean {
  const legacyPrefixes = ["Swift ", "Clever ", "Bright ", "Calm ", "Bold ", "Keen ", "Wise ", "Cool "];
  return legacyPrefixes.some((p) => name.startsWith(p));
}

export function getOrCreateCollabUser(defaultName?: string): CollabUser {
  if (typeof window === "undefined") {
    return { id: generateId(), name: defaultName || "Guest", color: COLORS[0] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed.name === "string") {
        // Discard legacy adjective names like "Swift Fox"
        if (!isLegacyName(parsed.name) && parsed.name.trim()) {
          return parsed;
        }
      }
    } catch {
      // fall through to create new
    }
  }

  const user: CollabUser = {
    id: generateId(),
    name: defaultName || "Guest",
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function updateCollabUserName(name: string): CollabUser {
  const current = getOrCreateCollabUser();
  const updated = { ...current, name: name.trim() || "Guest" };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(COLLAB_NAME_CHANGE_EVENT, { detail: { name: updated.name } })
    );
  }
  return updated;
}
