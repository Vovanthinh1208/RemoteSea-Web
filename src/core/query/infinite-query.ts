import type { QueryKey } from "@tanstack/react-query";
import type { PaginationMeta } from "@/core/pagination/pagination";

export type PagedFetchResult<TItem> = {
  items: TItem[];
  pagination: PaginationMeta;
};

/**
 * Generic page-number -> useInfiniteQuery options for a paged list endpoint.
 * Not wired into any screen yet — every current list (e.g. Jobs board) still uses
 * numbered pagination via useQuery + placeholderData. This exists so a feature can
 * opt into infinite scroll later without inventing its own pageParam/getNextPageParam
 * plumbing from scratch.
 */
export const createPagedInfiniteQueryOptions = <TItem>(config: {
  queryKey: QueryKey;
  fetchPage: (
    pageParam: number,
    signal: AbortSignal
  ) => Promise<PagedFetchResult<TItem>>;
  initialPageParam?: number;
}) => ({
  queryKey: config.queryKey,
  initialPageParam: config.initialPageParam ?? 1,
  queryFn: ({
    pageParam,
    signal,
  }: {
    pageParam: number;
    signal: AbortSignal;
  }) => config.fetchPage(pageParam, signal),
  getNextPageParam: (lastPage: PagedFetchResult<TItem>) =>
    lastPage.pagination.page < lastPage.pagination.pages
      ? lastPage.pagination.page + 1
      : undefined,
});
