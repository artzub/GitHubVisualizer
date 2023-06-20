import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Services } from '@/models/Services';

import emojisSlice from '@/redux/modules/emojis';

export const useGithubEmojis = (service) => {
  const dispatch = useDispatch();

  const { items: emojis } = useSelector(emojisSlice.selectors.getState);

  // fetch list of emojis
  useEffect(
    () => {
      if (service !== Services.Github || Object.values(emojis).length) {
        return undefined;
      }

      dispatch(emojisSlice.actions.fetch());

      return () => {
        dispatch(emojisSlice.actions.cancel());
      };
    },
    [service],
  );
};
