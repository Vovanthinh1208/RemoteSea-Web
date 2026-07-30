import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  page,
  pages,
  onPageChange,
}: PaginationProps) => {
  if (pages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        aria-label="Previous page"
        className="grid h-9 w-9 place-items-center rounded-8 border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          aria-current={n === page ? "page" : undefined}
          onClick={() => onPageChange(n)}
          className={cn(
            "grid h-9 min-w-9 place-items-center rounded-8 px-2 text-sm transition-colors",
            n === page
              ? "bg-brand-600 font-medium text-white"
              : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
          )}
        >
          {n}
        </button>
      ))}
      <button
        aria-label="Next page"
        className="grid h-9 w-9 place-items-center rounded-8 border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-40"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
