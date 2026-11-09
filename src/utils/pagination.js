const parsePagination = (query, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || defaultLimit;

  if (limit <= 0) {
    limit = defaultLimit;
  }
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const formatPaginationMeta = ({ page, limit, skip, total }) => {
  const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);
  return {
    page,
    limit,
    skip,
    total,
    totalPages
  };
};

module.exports = {
  parsePagination,
  formatPaginationMeta
};

