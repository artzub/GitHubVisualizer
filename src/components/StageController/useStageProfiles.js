import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import profilesSlice from '@/redux/modules/profiles';

export const useStageProfiles = (service, profile) => {
  const dispatch = useDispatch();
  const { selected } = useSelector(profilesSlice.selectors.getState);
  const { login } = selected || {};

  // fetch list of top users
  useEffect(
    () => {
      dispatch(profilesSlice.actions.fetchTop(null, 'global'));

      return () => {
        dispatch(profilesSlice.actions.cancel('global'));
      };
    },
    [dispatch, service],
  );

  useEffect(
    () => {
      dispatch(profilesSlice.actions.clear());
    },
    [dispatch, service],
  );

  useEffect(
    () => {
      if (!profile || login === profile) {
        return;
      }

      dispatch(profilesSlice.actions.fetchProfile(profile, 'profile'));

      return () => {
        dispatch(profilesSlice.actions.cancel('profile'));
      };
    },
    [profile, login, dispatch],
  );
};
