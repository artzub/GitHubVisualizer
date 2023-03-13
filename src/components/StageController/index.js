import { useRouteMatches } from '@/shared/hooks/useRouteMatches';

import { useGithubEmojis } from './useGithubEmojis';
import { useStageBranches } from './useStageBranches';
import { useStageCommits } from './useStageCommits';
import { useStageProfiles } from './useStageProfiles';
import { useStageRepositories } from './useStageRepositories';

const StageController = () => {
  const { service, profile, repository, branch, commits } = useRouteMatches();

  useGithubEmojis(service);
  useStageProfiles(service, profile);
  useStageRepositories(repository);
  useStageBranches(branch);
  useStageCommits(commits);

  return null;
};

export default StageController;
