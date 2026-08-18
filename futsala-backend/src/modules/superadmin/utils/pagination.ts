const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
}

export function parseCursorPagination(query: Record<string, unknown>): CursorPaginationParams {
  const rawCursor = query.cursor;
  const rawLimit = query.limit;

  const cursor = typeof rawCursor === 'string' && rawCursor.trim().length > 0 ? rawCursor : undefined;

  const parsed = Number(rawLimit);
  const numericLimit = Number.isFinite(parsed) ? parsed : DEFAULT_LIMIT;
  const limit = Math.min(Math.max(Math.trunc(numericLimit), 1), MAX_LIMIT);

  return { cursor, limit };
}

export function buildCursorPage<T extends { id: string }>(
  rows: T[],
  limit: number
): { data: T[]; pagination: CursorPaginationMeta } {
  const hasNextPage = rows.length > limit;
  const data = hasNextPage ? rows.slice(0, limit) : rows;
  const nextCursor = hasNextPage ? data[data.length - 1]?.id ?? null : null;

  return {
    data,
    pagination: {
      nextCursor,
      hasNextPage,
      limit,
    },
  };
}
