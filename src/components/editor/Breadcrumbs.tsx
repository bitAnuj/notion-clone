import { ChevronRight } from "lucide-react";
import { usePageStore } from "../../store/usePageStore";
import type { Page } from "../../types/page";

type BreadcrumbsProps = {
  page: Page;
};

function Breadcrumbs({ page }: BreadcrumbsProps) {
  const { pages, selectPage } = usePageStore();

  const trail: Page[] = [];
  let current: Page | undefined = page;

  while (current) {
    trail.unshift(current);
    current = pages.find((p) => p.id === current!.parentId);
  }

  if (trail.length <= 1) return null;

  return (
    <div className="mb-4 flex items-center gap-1 text-sm text-zinc-500">
      {trail.map((p, i) => (
        <span key={p.id} className="flex items-center gap-1">
          <button
            onClick={() => selectPage(p.id)}
            className={`flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-zinc-800 hover:text-zinc-200 ${
              i === trail.length - 1 ? "text-zinc-200" : ""
            }`}
          >
            <span>{p.icon || "📄"}</span>
            <span className="max-w-[140px] truncate">
              {p.title || "Untitled"}
            </span>
          </button>
          {i < trail.length - 1 && <ChevronRight size={14} />}
        </span>
      ))}
    </div>
  );
}

export default Breadcrumbs;
