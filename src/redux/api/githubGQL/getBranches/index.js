import { addCursorAfter, parsePageInfo } from '@/redux/api/githubGQL/utils';
import { withCancellation } from '@/redux/utils';

import getClient from '../getClient';

import query from './query.graphql';

/**
 * Gets branches by owner and repo
 * @param {Object} options
 * @param {String} options.owner - login of a user of an organization
 * @param {String} options.repo - name of repository
 * @param {Number} [options.perPage] - page size, default 10, (max is 100)
 * @param {String} [options.page] - cursor of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getBranches = (options) => withCancellation(async (signal) => {
  const { owner, repo, page = '', perPage = 10 } = options || {};
  const client = getClient();

  const fixedQuery = addCursorAfter(query, page);

  const data = await client.graphql(fixedQuery, {
    owner,
    repo,
    perPage,
    page,
    request: {
      signal,
    },
  });

  return {
    data: data?.repository?.refs?.nodes,
    pageInfo: parsePageInfo(data?.repository?.refs),
    rateLimit: data?.rateLimit,
  };
});
