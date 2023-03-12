import { useRef } from 'react';
import { useMatch } from 'react-router-dom';

const servicePath = '/:service';
const profilePath = `${servicePath}/:profile`;
const repositoryPath = `${profilePath}/:repository`;
const branchPath = `${repositoryPath}/:branch`;
const commitsPath = `${branchPath}/:commits`;

const allowedServices = ['github', 'gitlab', 'bitbucket'];

export const useRouteMatches = () => {
  const { params: { service } = {} } = useMatch({ path: servicePath, end: false }) || {};
  const { params: { profile } = {} } = useMatch({ path: profilePath, end: false }) || {};
  const { params: { repository } = {} } = useMatch({ path: repositoryPath, end: false }) || {};
  const { params: { branch } = {} } = useMatch({ path: branchPath, end: false }) || {};
  const { params: { commits } = {} } = useMatch({ path: commitsPath, end: false }) || {};

  const refs = useRef({});

  if (!service || allowedServices.includes(service)) {
    refs.current = {
      service,
      profile,
      repository,
      branch,
      commits,
    };
  }

  return refs.current;
};
