import { withCancellation } from '@/redux/utils';

import getClient from './getClient';
import { parsePageInfo, parseRateLimit } from './utils';

const reg = /page=(\d+)>; rel="last"/;
const getCount = (link, defValue = 0) => (link?.includes?.('rel="last"') ? +link.match(reg)[1] : defValue);

/**
 * Gets branches by owner and repo
 * @param {Object} options
 * @param {String} options.owner - login of a user of an organization
 * @param {String} options.repo - name of repository
 * @param {Number} [options.perPage] - page size, default 10, (max is 100)
 * @param {Number} [options.page] - index of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getBranches = (options) => withCancellation(async (signal) => {
  const { owner, repo, perPage = 10, page } = options || {};
  const client = getClient();

  const data = await client.repos.listBranches({
    owner,
    repo,
    per_page: perPage,
    page,
    request: {
      signal,
    },
  });

  const branches = await Promise.all(
    (data?.data || []).map(async (branch) => {
      const commits = await client.repos.listCommits({
        repo,
        owner,
        sha: branch.name,
        per_page: 1,
        request: {
          signal,
        },
      });

      return [
        {
          ...branch,
          commits: getCount(commits?.headers?.link, commits?.data?.length),
        },
        commits?.headers,
      ];
    }),
  );

  const [[, rateHeaders]] = branches.slice(-1);

  return {
    data: branches.map(([item]) => item),
    pageInfo: parsePageInfo(data?.headers),
    rateLimit: parseRateLimit(rateHeaders),
  };
});
