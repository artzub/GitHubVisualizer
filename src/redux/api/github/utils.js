export const parseRateLimit = (headers = {}) => ({
  limit: +headers['x-ratelimit-limit'],
  remaining: +headers['x-ratelimit-remaining'],
  resetAt: +headers['x-ratelimit-reset'] * 1000,
});

const reg = /page=(\d+)>; rel="next"/;
export const parsePageInfo = ({ link = '' } = {}) => {
  const hasNextPage = Boolean(link && link.includes('rel="next"'));
  let nextPage;

  if (hasNextPage) {
    nextPage = +link.match(reg)[1];
  }

  return {
    nextPage,
    hasNextPage,
  };
};
