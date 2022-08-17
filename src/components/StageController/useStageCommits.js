import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import branchesSlice from '@/redux/modules/branches';
import commitsSlice from '@/redux/modules/commits';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';

import { useUIProperty } from '@/shared/hooks';

export const useStageCommits = (amount) => {
  const dispatch = useDispatch();
  const [, setStoredValue] = useUIProperty('commitsCount');
  const [, setStart] = useUIProperty('start');
  const [, setPause] = useUIProperty('pause');
  const [refreshKey] = useUIProperty('refreshKey');

  const { selected: repository } = useSelector(repositoriesSlice.selectors.getState);
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);
  const { selected } = useSelector(branchesSlice.selectors.getState);

  const { login: owner } = profile || {};
  const { name: repo } = repository || {};
  const { name: branch } = selected || {};

  useEffect(
    () => {
      const fixedAmount = +amount;

      if (!branch || !owner || !repo || !fixedAmount || fixedAmount < 1) {
        return undefined;
      }

      setStart(false);
      setPause(false);

      dispatch(commitsSlice.actions.clear());

      setStoredValue(fixedAmount);

      dispatch(commitsSlice.actions.fetch({
        owner,
        repo,
        branch,
        amount: fixedAmount,
      }));

      return () => {
        dispatch(commitsSlice.actions.cancel());
      };
    },
    [
      branch, owner, repo,
      dispatch, amount, setStoredValue,
      refreshKey, setStart, setPause,
    ],
  );
};
