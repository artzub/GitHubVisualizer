import { withCancellation } from '@/redux/utils';

import getClient from './getClient';
import { profile } from './transforms';
import { parseRateLimit } from './utils';

/**
 * Gets profile by owner's login
 * @param {String} [login] - login of a user
 * @return {Promise<{rateLimit: *, data: object}>}
 */
export const getProfile = (login) => withCancellation(async (signal) => {
  const client = getClient();

  const request = {
    signal,
  };

  const promise = login
    ? client.users.getByUsername({
      username: login,
      request,
    })
    : client.users.getAuthenticated({
      request,
    });

  const data = await promise;

  return {
    data: data?.data && profile(data?.data),
    rateLimit: parseRateLimit(data?.headers),
  };
});
