import { parseRateLimit, parsePageInfo } from '@/redux/api/github/utils';
import { withCancellation } from '@/redux/utils';

import getClient from './getClient';
import { repository } from './transforms';

/**
 * Gets repositories of an owner
 * @param {String} owner - login of a user of an organization
 * @param {Number} [perPage] - page size, default 10, (max is 100)
 * @param {Number} [page] - index of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getRepositories = ({ owner, perPage = 10, page }) =>
  withCancellation(async (signal) => {
    const client = getClient();

    const data = await client.repos.listForUser({
      username: owner,
      per_page: perPage,
      page,
      request: {
        signal,
      },
    });

    return {
      data: (data?.data || []).map(repository),
      pageInfo: parsePageInfo(data?.headers),
      rateLimit: parseRateLimit(data?.headers),
    };
  });
