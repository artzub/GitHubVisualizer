import { useEffect } from 'react';
import branchesSlice from '@/redux/modules/branches';
import emojisSlice from '@/redux/modules/emojis';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';
import { useDispatch, useSelector } from 'react-redux';

export default () => {
  const dispatch = useDispatch();
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);
  const { selected: repository } = useSelector(repositoriesSlice.selectors.getState);
  const { items: branches, selected: branch } = useSelector(branchesSlice.selectors.getState);

  const owner = profile?.login;
  const amount = profile?.public_repos;
  const repo = repository?.name;
  const defaultBranch = repository?.default_branch;

  useEffect(
    () => {
      dispatch(profilesSlice.actions.fetchTop(null, 'global'));
    },
    [dispatch],
  );

  useEffect(
    () => {
      dispatch(emojisSlice.actions.fetch());
    },
    [dispatch],
  );

  useEffect(
    () => {
      dispatch(repositoriesSlice.actions.clear());
      dispatch(repositoriesSlice.actions.fetchRepositories({ owner, amount }));

      return () => {
        dispatch(repositoriesSlice.actions.cancel());
      };
    },
    [dispatch, owner, amount],
  );

  useEffect(
    () => {
      dispatch(branchesSlice.actions.clear());
      if (!repo) {
        return undefined;
      }

      dispatch(branchesSlice.actions.fetch({
        owner,
        repo,
      }));

      return () => {
        dispatch(branchesSlice.actions.cancel());
      };
    },
    [dispatch, owner, repo],
  );

  useEffect(
    () => {
      if (!branches.length || branch || !defaultBranch) {
        return;
      }

      const item = branches.find(({ name }) => name === defaultBranch);

      if (item) {
        dispatch(branchesSlice.actions.setSelected(item));
      }
    },
    [branch, branches, defaultBranch, dispatch],
  );

  return null;
};
