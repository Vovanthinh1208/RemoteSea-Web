import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const SIBLING_COUNT = 1;
const ELLIPSIS = "…";
// The most slots windowing can ever produce (first, ellipsis, 3 siblings,
// ellipsis, last) — below this, showing every page takes no more room than
// windowing would anyway, so there's no reason to collapse anything (and
// doing so risks an ellipsis hiding just a single page, e.g. "1 2 … 4" for
// only 4 total pages, which reads worse than just showing "1 2 3 4").
const MAX_PAGES_BEFORE_WINDOWING = 7;

// Windowed page list (first, last, current ± SIBLING_COUNT, with an "…" for
// any real gap) instead of one button per page — rendering all N pages
// inline works fine at 5 pages but turns into an unreadable wall of buttons
// once a list has real pagination depth (30, 50+ pages), the same "don't
// retrieve/render more than the user can actually use" principle applied to
// page numbers instead of data.
const buildPageWindow = (
  page: number,
  pages: number
): (number | typeof ELLIPSIS)[] => {
  if (pages <= MAX_PAGES_BEFORE_WINDOWING) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  const shown = new Set<number>([1, pages]);
  for (let n = page - SIBLING_COUNT; n <= page + SIBLING_COUNT; n++) {
    if (n >= 1 && n <= pages) shown.add(n);
  }

  const result: (number | typeof ELLIPSIS)[] = [];
  let prev = 0;
  for (const n of Array.from(shown).sort((a, b) => a - b)) {
    // A gap of exactly one page (e.g. 4 then 6) would hide a single number
    // behind "…" — worse than just showing it, so only collapse a gap of
    // two or more.
    if (prev && n - prev === 2) result.push(prev + 1);
    else if (prev && n - prev > 2) result.push(ELLIPSIS);
    result.push(n);
    prev = n;
  }
  return result;
};

export const Pagination = ({ page, pages, onPageChange }: PaginationProps) => {
  if (pages <= 1) return null;

  const pageWindow = buildPageWindow(page, pages);

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        aria-label="Previous page"
        className="grid h-9 w-9 place-items-center rounded-8 border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>
      {pageWindow.map((n, i) =>
        n === ELLIPSIS ? (
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center text-sm text-neutral-300"
            key={`ellipsis-${i}`}
          >
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={n}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPageChange(n)}
            className={cn(
              "grid h-9 min-w-9 place-items-center rounded-8 px-2 text-sm transition-colors focus-visible:shadow-focus focus-visible:outline-none",
              n === page
                ? "bg-brand-600 font-medium text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
            )}
          >
            {n}
          </button>
        )
      )}
      <button
        aria-label="Next page"
        className="grid h-9 w-9 place-items-center rounded-8 border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-40"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
