import { parsePageInfo, parseRateLimit } from '@/redux/api/github/utils';
import { withCancellation } from '@/redux/utils';

import getClient from './getClient';

/**
 * Gets commits from a repo's branch of a user
 * @param {Object} options
 * @param {String} options.owner - login of a user of an organization
 * @param {String} options.repo - name of repository
 * @param {String} options.branch - name of branch
 * @param {Number} [options.perPage] - page size, default 10, (max is 100)
 * @param {Number} [options.page] - index of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getCommits = (options) => withCancellation(async (signal) => {
  const { owner, repo, branch, perPage = 10, page } = options || {};
  const client = getClient();

  const data = await client.repos.listCommits({
    repo,
    owner,
    sha: branch,
    per_page: perPage,
    page,
    request: {
      signal,
    },
  });

  const ids = data?.data?.map(({ sha }) => sha) || [];

  const commits = await Promise.all(
    ids.map(async (ref) => {
      const d = await client.repos.getCommit({
        owner,
        repo,
        ref,
        request: {
          signal,
        },
      });
      return [d?.data, d?.headers];
    }),
  );

  const [[, rateHeaders]] = commits.slice(-1);

  return {
    data: commits.map(([item]) => item),
    pageInfo: parsePageInfo(data?.headers),
    rateLimit: parseRateLimit(rateHeaders),
  };
});
