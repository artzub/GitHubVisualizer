import { parseRateLimit } from "@/redux/api/githubGQL/utils";
import { withCancellation } from "@/redux/utils";
import getClient from '../getClient';
import query from './query.graphql';

/**
 * Searches accounts by text
 * @param {String} search
 * @return {Promise<{rateLimit: *, data: Array}>}
 */
export const searchAccount = (search) => withCancellation(async (signal) => {
  const client = getClient();

  const data = await client.graphql(query, {
    search,
    request: {
      signal,
    },
  });

  return {
    data: data?.search?.nodes || [],
    rateLimit: parseRateLimit(data?.rateLimit),
  };
});
