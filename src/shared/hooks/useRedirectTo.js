import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { UrlPratTypes } from '@/models/UrlPartTypes';

import { useRouteMatches } from './useRouteMatches';

const order = [
  UrlPratTypes.service,
  UrlPratTypes.profile,
  UrlPratTypes.repository,
  UrlPratTypes.branch,
  UrlPratTypes.commits,
];

/**
 * @param {UrlPratTypes} urlPartType
 * @return {function(string): void}
 */
export const useRedirectTo = (urlPartType) => {
  const navigate = useNavigate();
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
      const index = order.indexOf(urlPartType);
      if (index < 0 || hash[urlPartType] === part) {
        return;
      }

      let url = order.slice(0, index).map((key) => hash[key]).join('/');
      url = url ? `/${url}` : url;

      navigate(`${url}/${part}`);
    },
    [hash, navigate, urlPartType],
  );
};
