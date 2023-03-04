import { withCancellation } from '@/redux/utils';

import getClient from '../getClient';
import { addCursorAfter, parsePageInfo } from '../utils';

import query from './query.graphql';

/**
 * Gets commits from a repo's branch of a user
 * @param {String} owner - login of a user of an organization
 * @param {String} repo - name of repository
 * @param {String} branch - name of branch
 * @param {Number} [perPage] - page size, default 10, (max is 100)
 * @param {String} [page] - cursor of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getCommits = ({ owner, repo, branch, page = '', perPage = 10 }) =>
  withCancellation(async (signal) => {
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

    const commits = await Promise.all(ids.map(async (ref) => {
      const d = await client.repos.getCommit({
        owner,
        repo,
        ref,
        request: {
          signal,
        },
      });
      return d?.data;
    }));

    return {
      data: commits,
      pageInfo: parsePageInfo(history),
      rateLimit: data?.rateLimit,
    };
  });
