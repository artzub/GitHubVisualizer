import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useStageBranches } from '@/components/StageController/useStageBranches';
import { useStageCommits } from '@/components/StageController/useStageCommits';
import { useStageProfiles } from '@/components/StageController/useStageProfiles';
import { useStageRepositories } from '@/components/StageController/useStageRepositories';
import emojisSlice from '@/redux/modules/emojis';
import { useRouteMatches } from '@/shared/hooks/useRouteMatches';

const StageController = () => {
  const dispatch = useDispatch();

  const {
    service,
    profile,
    repository,
    branch,
    commits,
  } = useRouteMatches();

  // fetch list of emojis
  useEffect(
    () => {
      dispatch(emojisSlice.actions.fetch());

      return () => {
        dispatch(emojisSlice.actions.cancel());
      };
    },
    [service, dispatch],
  );

  useStageProfiles(service, profile);
  useStageRepositories(repository);
  useStageBranches(branch);
  useStageCommits(commits);

  return null;
};

export default StageController;
