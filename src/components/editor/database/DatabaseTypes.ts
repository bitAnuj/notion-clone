export type DatabaseStatus = "Not Started" | "In Progress" | "Done";

export type DatabaseItem = {
  id: string;
  title: string;
  status: DatabaseStatus;
};

export const STATUSES: DatabaseStatus[] = [
  "Not Started",
  "In Progress",
  "Done",
];

export const STATUS_COLORS: Record<DatabaseStatus, string> = {
  "Not Started": "bg-zinc-700 text-zinc-300",
  "In Progress": "bg-blue-900 text-blue-300",
  Done: "bg-green-900 text-green-300",
};
