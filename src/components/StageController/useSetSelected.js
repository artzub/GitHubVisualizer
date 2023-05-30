import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const defaultCondition = (name, selected) => name === selected;

/**
 * @param name - is needed to find
 * @param selected - already selected
 * @param {Array} items
 * @param {Function} action
 * @param {Function} [skipCondition]
 * @param {Function} [preAction]
 */
export const useSetSelected = ({
  name,
  selected,
  items,
  action,
  skipCondition,
  preAction,
}) => {
  const dispatch = useDispatch();

  const skip = skipCondition || defaultCondition;

  useEffect(
    () => {
      if (preAction) {
        preAction();
      }

      if (!items?.length || skip(name, selected)) {
        return;
      }

      const found = items.find((item) => item.name === name);

      // if (!found) {
      //   return;
      // }

      dispatch(action(found));
    },
    [name, selected, items, action, preAction, skip],
  );
};
