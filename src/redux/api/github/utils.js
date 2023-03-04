export const parseRateLimit = (headers = {}) => ({
  limit: +headers['x-ratelimit-limit'],
  remaining: +headers['x-ratelimit-remaining'],
  resetAt: +headers['x-ratelimit-reset'] * 1000,
});

const reg = /page=(\d+)>; rel="next"/;
const regPerPage = /per_page=(\d+)/;
const regPageCount = /page=(\d+)>; rel="last"/;
export const parsePageInfo = ({ link = '' } = {}) => {
  const hasNextPage = link?.includes?.('rel="next"');
  let nextPage;

  if (hasNextPage) {
    nextPage = +link.match(reg)[1];
  }

  let total = 0;
  if (link?.includes?.('rel="last"')) {
    total = +link.match(regPerPage)[1];
    total *= +link.match(regPageCount)[1];
  }

  return {
    total,
    nextPage,
    hasNextPage,
  };
};
