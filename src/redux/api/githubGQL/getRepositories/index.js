import { withCancellation } from '@/redux/utils';

import getClient from '../getClient';
import { addCursorAfter, parsePageInfo } from '../utils';
import query from './query.graphql';

/**
 * Gets repositories of an owner
 * @param {String} owner - login of a user of an organization
 * @param {Number} [perPage] - page size, default 10, (max is 100)
 * @param {String} [page] - cursor of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getRepositories = ({ owner, page = '', perPage = 10 }) =>
  withCancellation(async (signal) => {
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
