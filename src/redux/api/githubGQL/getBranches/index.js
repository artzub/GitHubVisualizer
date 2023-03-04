import { addCursorAfter, parsePageInfo } from '@/redux/api/githubGQL/utils';
import { withCancellation } from '@/redux/utils';

import getClient from '../getClient';

import query from './query.graphql';

/**
 * Gets branches by owner and repo
 * @param {String} owner - login of a user of an organization
 * @param {String} repo - name of repository
 * @param {Number} [perPage] - page size, default 10, (max is 100)
 * @param {String} [page] - cursor of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getBranches = ({ owner, repo, page = '', perPage = 10 }) =>
  withCancellation(async (signal) => {
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
