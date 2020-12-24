import { parsePageInfo, parseRateLimit } from "@/redux/api/github/utils";
import { withCancellation } from "@/redux/utils";
import getClient from './getClient';

/**
 * Gets commits from a repo's branch of a user
 * @param {String} owner - login of a user of an organization
 * @param {String} repo - name of repository
 * @param {String} branch - name of branch
 * @param {Number} [perPage] - page size, default 10, (max is 100)
 * @param {Number} [page] - index of page
 * @return {Promise<{rateLimit: *, data: Array, pageInfo: *}>}
 */
export const getCommits = ({ owner, repo, branch, perPage = 10, page }) =>
  withCancellation(async (signal) => {
    const client = getClient();

    const data = await client.repos.listCommits({
      repo,
      owner,
      sha: branch,
      per_page: perPage,
      page,
      request: {
        signal,
      },
    });

    const ids = data?.data?.map(({ sha }) => sha) || [];

    const commits = await Promise.all(ids.map(async (ref) => {
      const d = await client.repos.getCommit({
        owner,
        repo,
        ref,
        request: {
          signal,
        },
      });
      return [d?.data, d?.headers];
    }));

    const [[,rateHeaders]] = commits.slice(-1);

    return {
      data: commits.map(([item]) => item),
      pageInfo: parsePageInfo(data?.headers),
      rateLimit: parseRateLimit(rateHeaders),
    };
  });
