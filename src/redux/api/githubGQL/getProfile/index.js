import { withCancellation } from '@/redux/utils';

import getClient from '../getClient';
import query from './query.graphql';

/**
 * Gets profile by owner's login
 * @param {String} login - login of a user
 * @param {Boolean} [isOrganization] - if true then receiving organization
 * @return {Promise<{rateLimit: *, data: object}>}
 */
export const getProfile = (login, isOrganization = false) =>
  withCancellation(async (singal) => {
    const client = getClient();

    const data = await client.graphql(query, {
      login,
      isOrganization,
    });

    return {
      data: data?.organization || data?.user,
      rateLimit: data?.rateLimit,
    };
  });
