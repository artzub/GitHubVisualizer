import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { UrlPratTypes } from '@/models/UrlPartTypes';

import branchesSlice from '@/redux/modules/branches';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';

import { useRedirectTo } from '@/shared/hooks/useRedirectTo';

import { useSetSelected } from './useSetSelected';

/**
 * @param name - name of branch
 */
export const useStageBranches = (name) => {
  const dispatch = useDispatch();
  const redirectTo = useRedirectTo(UrlPratTypes.branch);

  const { selected: repository } = useSelector(
    repositoriesSlice.selectors.getState,
  );
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);
  const { selected, items } = useSelector(branchesSlice.selectors.getState);

  const { login: owner } = profile || {};
  const { name: repo, defaultBranch } = repository || {};
  const { name: branch } = selected || {};

  useEffect(
    () => {
      dispatch(branchesSlice.actions.clear());
      if (!repo) {
        return undefined;
      }

      dispatch(
        branchesSlice.actions.fetch({
          owner,
          repo,
        }),
      );

      return () => {
        dispatch(branchesSlice.actions.cancel());
      };
    },
    [owner, repo],
  );

  useSetSelected({
    name: name === 'default' ? defaultBranch : name,
    selected: branch,
    items,
    action: branchesSlice.actions.setSelected,
  });

  if (!(name || branch) && defaultBranch) {
    redirectTo(defaultBranch);
  }
};
