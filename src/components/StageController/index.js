import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import emojisSlice from '@/redux/modules/emojis';

import { useRouteMatches } from '@/shared/hooks/useRouteMatches';

import { useStageBranches } from './useStageBranches';
import { useStageCommits } from './useStageCommits';
import { useStageProfiles } from './useStageProfiles';
import { useStageRepositories } from './useStageRepositories';

const StageController = () => {
  const dispatch = useDispatch();

  const { service, profile, repository, branch, commits } = useRouteMatches();

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
