import { withCancellation } from '@/redux/utils';

import getClient from '../getClient';
import { addCursorAfter, parsePageInfo } from '../utils';

import query from './query.graphql';

/**
 * Gets commits from a repo's branch of a user
 * @param {Object} options
 * @param {String} options.owner - login of a user of an organization
 * @param {String} options.repo - name of repository
 * @param {String} options.branch - name of branch
 * @param {Number} [options.perPage] - page size, default 10, (max is 100)
 * @param {String} [options.page] - cursor of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getCommits = (options) => withCancellation(async (signal) => {
  const { owner, repo, branch, page = '', perPage = 10 } = options || {};
  const client = getClient();

  const fixedQuery = addCursorAfter(query, page);

  const data = await client.graphql(fixedQuery, {
    owner,
    repo,
    perPage,
    branch,
    page,
    request: {
      signal,
    },
  });

  const history = data?.repository?.ref?.target?.history || {};

  const ids = history.nodes?.map(({ oid }) => oid) || [];

  const commits = await Promise.all(
    ids.map(async (ref) => {
      const d = await client.repos.getCommit({
        owner,
        repo,
        ref,
        request: {
          signal,
        },
      });
      return d?.data;
    }),
  );

  return {
    data: commits,
    pageInfo: parsePageInfo(history),
    rateLimit: data?.rateLimit,
  };
});
