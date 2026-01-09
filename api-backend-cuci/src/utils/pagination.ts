export const buildPagination = (page: number, limit: number, totalItems: number) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = page > totalPages ? totalPages : page;

  return {
    totalItems,
    totalPages,
    currentPage,
    limit
  };
};

export const getPaginationParams = (pageParam?: string, limitParam?: string) => {
  const page = Math.max(parseInt(pageParam || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(limitParam || '10', 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};
