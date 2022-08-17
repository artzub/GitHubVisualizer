import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import slice from '@/redux/modules/ui';

import { functionalUpdate } from '@/shared/utils/functionalUpdate';

/**
 * @param {String} property
 * @param {*} [defaultValue]
 * @return {[*, (function(*): void)]}
 */
export const useUIProperty = (property, defaultValue) => {
  const dispatch = useDispatch();
  const prop = useRef(null);

  prop.current = property || null;
  const { [property]: value = defaultValue } = useSelector(slice.selectors.getState);

  const prev = useRef(null);
  prev.current = value;

  const change = useCallback(
    (newValue) => {
      dispatch(slice.actions.change({
        [prop.current]: functionalUpdate(newValue, prev.current),
      }));
    },
    [dispatch],
  );

  return [value, change];
};
