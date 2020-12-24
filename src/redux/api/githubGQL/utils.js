export const addCursorAfter = (text, lastCursor) => {
  // eslint-disable-next-line no-new-func
  const parser = new Function(`return \`${text}\`;`);
  return parser.call({
    cursorArgument: lastCursor ? '$page: String!' : '',
    after: lastCursor ? 'after: $page' : '',
  });
};

export const parseRateLimit = ({ cost, remaining, resetAt } = {}) => ({
  limit: 5000,
  remaining,
  cost,
  resetAt: resetAt && +(new Date(resetAt)),
});
