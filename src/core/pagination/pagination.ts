export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PagedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type PageParams = { page: number; limit: number };

export const buildPageParams = ({ page, limit }: PageParams): PageParams => ({ page, limit });
