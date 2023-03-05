import { withCancellation } from '@/redux/utils';

import getClient from '../getClient';
import { addCursorAfter, parsePageInfo } from '../utils';

import query from './query.graphql';

/**
 * Gets repositories of an owner
 * @param {Object} options
 * @param {String} options.owner - login of a user of an organization
 * @param {Number} [options.perPage] - page size, default 10, (max is 100)
 * @param {String} [options.page] - cursor of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getRepositories = (options) => withCancellation(async (signal) => {
  const { owner, page = '', perPage = 10 } = options || {};
  const client = getClient();

  const fixedQuery = addCursorAfter(query, page);

  const data = await client.graphql(fixedQuery, {
    owner,
    perPage,
    page,
    request: {
      signal,
    },
  });

  // TODO add transforms/repository

  return {
    data: data?.profile?.repositories?.nodes,
    pageInfo: parsePageInfo(data?.profile?.repositories),
    rateLimit: data?.rateLimit,
  };
});
