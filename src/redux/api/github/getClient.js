import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { Octokit } from '@octokit/rest';

let instance;

export default () => {
  if (instance) {
    return instance;
  }

  instance = new Octokit({
    userAgent: 'visgit/v1.0.0',
    authStrategy: createOAuthAppAuth,
    auth: {
      type: 'oauth-app',
      clientId: process.env.REACT_APP_CLIENT_ID,
      clientSecret: process.env.REACT_APP_CLIENT_SECRET,
    },
  });

  return instance;
};
