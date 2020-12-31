import { useEffect } from 'react';
import { useSetSelected } from '@/components/StageController/useSetSelected';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';
import { useDispatch, useSelector } from 'react-redux';

/**
 * @param {String} name - name of repository
 */
export const useStageRepositories = (name) => {
  const dispatch = useDispatch();
  const { selected, items } = useSelector(repositoriesSlice.selectors.getState);
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);

  const { login: owner, public_repos: amount = 0 } = profile || {};
  const { name: repository } = selected || {};

  useEffect(
    () => {
      dispatch(repositoriesSlice.actions.clear());
      dispatch(repositoriesSlice.actions.fetch({
        owner,
        amount,
      }));

      return () => {
        dispatch(repositoriesSlice.actions.cancel());
      };
    },
    [owner, amount, dispatch],
  );

  useSetSelected({
    name,
    selected: repository,
    items,
    action: repositoriesSlice.actions.setSelected,
  });
};
