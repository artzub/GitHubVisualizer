import { useEffect, useRef } from 'react';
import branchesSlice from '@/redux/modules/branches';
import commitsSlice from '@/redux/modules/commits';
import emojisSlice from '@/redux/modules/emojis';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';
import { useUIProperty } from '@/shared/hooks';
import { useDispatch, useSelector } from 'react-redux';

export default () => {
  const dispatch = useDispatch();
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);
  const { selected: repository } = useSelector(repositoriesSlice.selectors.getState);
  const { items: branches, selected: branch } = useSelector(branchesSlice.selectors.getState);
  const { isFetching } = useSelector(commitsSlice.selectors.getState);
  const lastFetching = useRef(isFetching);
  const [isAnalysing, setIsAnalysing] = useUIProperty('isAnalysing');
  const [commits] = useUIProperty('commitsCount', 0);

  const owner = profile?.login;
  const amount = profile?.public_repos;
  const repo = repository?.name;
  const defaultBranch = repository?.default_branch;

  // fetch list of top users
  useEffect(
    () => {
      dispatch(profilesSlice.actions.fetchTop(null, 'global'));

      return () => {
        dispatch(profilesSlice.actions.cancel('global'));
      };
    },
    [dispatch],
  );

  // fetch list of emojis
  useEffect(
    () => {
      dispatch(emojisSlice.actions.fetch());

      return () => {
        dispatch(emojisSlice.actions.cancel());
      };
    },
    [dispatch],
  );

  // fetch all repositories of a owner
  useEffect(
    () => {
      dispatch(repositoriesSlice.actions.clear());
      dispatch(repositoriesSlice.actions.fetch({ owner, amount }));

      return () => {
        dispatch(repositoriesSlice.actions.cancel());
      };
    },
    [dispatch, owner, amount],
  );

  // fetch all branches of a repository
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

  // select a default branch of a repository
  useEffect(
    () => {
      setIsAnalysing(false);
      if (!branches.length || branch || !defaultBranch) {
        return;
      }

      const item = branches.find(({ name }) => name === defaultBranch);

      if (item) {
        dispatch(branchesSlice.actions.setSelected(item));
      }
    },
    [branch, branches, defaultBranch, dispatch, setIsAnalysing],
  );

  // fetch commits
  useEffect(
    () => {
      if (!isAnalysing) {
        return undefined;
      }

      dispatch(commitsSlice.actions.clear());
      if (!branch?.name || !owner || !repo || !commits) {
        return undefined;
      }

      dispatch(commitsSlice.actions.fetch({
        owner,
        repo,
        branch: branch.name,
        amount: commits,
      }));

      return () => {
        if (lastFetching.current) {
          dispatch(commitsSlice.actions.cancel());
        }
      };
    },
    [isAnalysing, branch, owner, repo, commits, dispatch],
  );

  useEffect(
    () => {
      if (lastFetching.current && !isFetching) {
        setIsAnalysing(false);
      }
      lastFetching.current = isFetching;
    },
    [isFetching, setIsAnalysing],
  );

  return null;
};
