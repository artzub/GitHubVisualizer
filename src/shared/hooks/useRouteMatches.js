import { useRouteMatch } from 'react-router-dom';

const servicePath = '/:service';
const profilePath = `${servicePath}/:profile`;
const repositoryPath = `${profilePath}/:repository`;
const branchPath = `${repositoryPath}/:branch`;
const commitsPath = `${branchPath}/:commits`;

export const useRouteMatches = () => {
  const { params: { service } = { service: 'github' } } = useRouteMatch({ path: servicePath, exact: false }) || {};
  const { params: { profile } = {} } = useRouteMatch({ path: profilePath, exact: false }) || {};
  const { params: { repository } = {} } = useRouteMatch({ path: repositoryPath, exact: false }) || {};
  const { params: { branch } = {} } = useRouteMatch({ path: branchPath, exact: false }) || {};
  const { params: { commits } = {} } = useRouteMatch({ path: commitsPath, exact: false }) || {};

  return {
    service,
    profile,
    repository,
    branch,
    commits,
  };
};
