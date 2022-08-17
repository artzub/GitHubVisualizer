import { Octokit } from '@octokit/rest';

let instance;
let lastToken;

// TODO Add WebFlow Auth

const getClient = () => {
  const token = localStorage.getItem('user_token');

  if (!instance || token !== lastToken) {
    lastToken = token || process.env.REACT_APP_PERSONAL_TOKEN;
    instance = new Octokit({
      userAgent: 'visgit/v1.0.0',
      auth: lastToken || process.env.REACT_APP_PERSONAL_TOKEN,
    });
  }

  return instance;
};

export default getClient;
