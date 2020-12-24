import { Octokit } from '@octokit/rest';

let instance;
let lastToken;

export default () => {
  const token = localStorage.getItem('user_token');

  if (!instance || lastToken !== token) {
    lastToken = token || process.env.REACT_APP_PERSONAL_TOKEN;
    instance = new Octokit({
      userAgent: 'visgit/v1.0.0',
      auth: lastToken,
    });
  }

  return instance;
};
