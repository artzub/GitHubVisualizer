import { withCancellation } from '@/redux/utils';

import getClient from './getClient';
import { parseRateLimit } from './utils';

/**
 * Gets list of emojis
 */
export const getEmojis = () => withCancellation(async (signal) => {
  const client = getClient();

  const data = await client.emojis.get({
    request: {
      signal,
    },
  });

  return {
    data: data?.data,
    rateLimit: parseRateLimit(data?.headers),
  };
});
