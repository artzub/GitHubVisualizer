import { useCallback, useMemo } from 'react';
import { UrlPratTypes } from '@/models/UrlPartTypes';
import { useHistory } from 'react-router-dom';
import { useRouteMatches } from './useRouteMatches';

const order = [
  UrlPratTypes.service,
  UrlPratTypes.profile,
  UrlPratTypes.repository,
  UrlPratTypes.branch,
  UrlPratTypes.commits,
];

export const useRedirectTo = (partType) => {
  const history = useHistory();
  const {
    service,
    profile,
    repository,
    branch,
  } = useRouteMatches();

  const hash = useMemo(
    () => ({
      [UrlPratTypes.service]: service,
      [UrlPratTypes.profile]: profile,
      [UrlPratTypes.repository]: repository,
      [UrlPratTypes.branch]: branch,
    }),
    [service, profile, repository, branch],
  );

  return useCallback(
    (part) => {
      const index = order.indexOf(partType);
      if (index < 0) {
        return;
      }

      let url = order.slice(0, index).map((key) => hash[key]).join('/');
      url = url ? `/${url}` : url;

      history.push(`${url}/${part}`);
    },
    [hash, history, partType],
  );
};
