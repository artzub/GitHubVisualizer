import { Octokit } from '@octokit/rest';

import { appNameVersion } from '@/shared/utils';

let instance;
let lastToken;

// TODO Add WebFlow Auth

const getClient = () => {
  const token = localStorage.getItem('githubToken');

  if (!instance || token !== lastToken) {
    lastToken = token || process.env.REACT_APP_PERSONAL_TOKEN;
    instance = new Octokit({
      userAgent: appNameVersion,
      auth: lastToken || process.env.REACT_APP_PERSONAL_TOKEN,
    });
  }

  return instance;
};

export default getClient;
