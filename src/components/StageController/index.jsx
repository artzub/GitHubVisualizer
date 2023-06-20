import { useRouteMatches } from '@/shared/hooks/useRouteMatches';

import { useGithubEmojis } from './useGithubEmojis';
import { useStageBranches } from './useStageBranches';
import { useStageCommits } from './useStageCommits';
import { useStageProfiles } from './useStageProfiles';
import { useStageRepositories } from './useStageRepositories';
import { useStateAuthenticated } from './useStateAuthenticated';

const Authenticated = () => {
  const { service, profile, repository, branch, commits } = useRouteMatches();

  useGithubEmojis(service);
  useStageProfiles(service, profile);
  useStageRepositories(repository);
  useStageBranches(branch);
  useStageCommits(commits);

  return null;
};

const Authentication = () => {
  const { service } = useRouteMatches();

  const isAuthenticated = useStateAuthenticated(service);

  return isAuthenticated ? <Authenticated /> : null;
};

const StageController = () => {
  const { service } = useRouteMatches();

  return service ? <Authentication /> : null;
};

export default StageController;
