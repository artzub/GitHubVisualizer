import { withCancellation } from '@/redux/utils';
import getClient from './getClient';
import { profile } from './transforms';
import { parseRateLimit } from './utils';

/**
 * Searches accounts by text
 * @param {String} search
 * @return {Promise<{rateLimit: *, data: Array}>}
 */
export const searchAccount = (search) => withCancellation(async (signal) => {
  const client = getClient();

  const data = await client.search.users({
    q: search,
    per_page: 10,
    request: {
      signal,
    },
  });

  return {
    data: (data?.data?.items || []).map(profile),
    rateLimit: parseRateLimit(data?.headers),
  };
});
