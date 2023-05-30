import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import useEventCallback from '@mui/material/utils/useEventCallback';

import errorsSlice from '@/redux/modules/errors';
import profilesSlice from '@/redux/modules/profiles';

const allowedErrors = [401, 403];

export const useStateAuthenticated = (service) => {
  const dispatch = useDispatch();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { authenticated } = useSelector(profilesSlice.selectors.getState);
  const { errorStatus } = useSelector(errorsSlice.selectors.getState);

  const isAuthenticated = useRef(false);
  isAuthenticated.current = !!authenticated;

  const needRefresh = useRef(0);
  const prevPathname = useRef(pathname);

  if (
    prevPathname.current !== pathname
    && pathname.startsWith(`/${service}`)
    && !isAuthenticated.current
  ) {
    needRefresh.current += 1;
  }

  console.log(
    'useStateAuthenticated',
    prevPathname.current,
    pathname,
    needRefresh.current,
  );

  prevPathname.current = pathname;

  const redirectToConnection = useEventCallback(() => {
    const path = `/settings/connection/${service}`;
    if (pathname !== path && service) {
      navigate(path, { state: { from: pathname } });
    }
  });

  useEffect(
    () => {
      console.log('request', service, needRefresh.current);
      isAuthenticated.current = false;
      dispatch(profilesSlice.actions.clear());
      dispatch(profilesSlice.actions.fetchAuthenticated(null, 'authenticated'));

      return () => {
        dispatch(profilesSlice.actions.cancel('authenticated'));
      };
    },
    [service, needRefresh.current],
  );

  useEffect(
    () => {
      if (!allowedErrors.includes(errorStatus)) {
        return;
      }

      isAuthenticated.current = false;

      dispatch(profilesSlice.actions.clear());
      dispatch(errorsSlice.actions.clear());

      redirectToConnection();
    },
    [errorStatus],
  );

  return isAuthenticated.current;
};
