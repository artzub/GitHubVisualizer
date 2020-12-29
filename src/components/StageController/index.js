import { useEffect } from "react";
import emojisSlice from "@/redux/modules/emojis";
import profilesSlice from "@/redux/modules/profiles";
import repositoriesSlice from "@/redux/modules/repositories";
import { useDispatch, useSelector } from "react-redux";

export default () => {
  const dispatch = useDispatch();
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);

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

  const login = profile?.login;
  const amount = profile?.public_repos;
  useEffect(
    () => {
      dispatch(repositoriesSlice.actions.fetchRepositories({ login, amount }));

      return () => {
        dispatch(repositoriesSlice.actions.cancel());
      };
    },
    [dispatch, login, amount],
  );

  return null;
};
