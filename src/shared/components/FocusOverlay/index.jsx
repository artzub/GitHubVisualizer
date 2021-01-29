import { useEffect, useRef } from 'react';
import * as cursor from '@/services/CursorService';
import * as focus from '@/services/FocusService';
import PropTypes from 'prop-types';
import { install, ResizeObserver } from 'resize-observer';

if (!window.ResizeObserver) {
  install();
}

const StateTypes = {
  hovered: 'hovered',
  focused: 'focused',
};

const FocusOverlay = ({ globalListener }) => {
  const roCallback = useRef();

  const ro = useRef(new ResizeObserver((...args) => {
    if (roCallback.current) {
      roCallback.current(...args);
    }
  }));

  useEffect(
    () => {
      if (!globalListener) {
        return undefined;
      }

      const state = {
        [StateTypes.current]: null,
        [StateTypes.focused]: null,
      };

      roCallback.current = (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== state.current && entry.target !== state.focused) {
            entries.forEach((entry) => ro.current.unobserve(entry.target));
          } else {
            if (entry.target === state[StateTypes.hovered]) {
              cursor.focusOn(state[StateTypes.hovered]);
            }

            if (entry.target === state[StateTypes.focused]) {
              focus.focusOn(state[StateTypes.focused]);
            }
          }
        });
      };

      const onEnter = (event) => {
        if (event?.target?.tabIndex < 0 || event.target === document) {
          return;
        }

        let item = state[StateTypes.hovered];

        if (item) {
          item.removeEventListener('pointerdown', onDown, true);
          document.removeEventListener('pointerup', onUp, true);
          ro.current.unobserve(item);
        }

        if (item !== event.target) {
          item = event.target;
          cursor.focusOn(item);
        }

        ro.current.observe(item);
        item.addEventListener('pointerdown', onDown, true);
        document.addEventListener('pointerup', onUp, true);

        state[StateTypes.hovered] = item;
      };

      const onFocus = (event) => {
        if (event?.target?.tabIndex < 0 || event.target === document) {
          return;
        }

        let item = state[StateTypes.focused];

        if (item) {
          ro.current.unobserve(item);
        }

        if (item !== event.target) {
          item = event.target;
          focus.focusOn(item);
        }

        ro.current.observe(item);

        state[StateTypes.focused] = item;
      };

      const onDown = () => {
        cursor.press();
      };

      const onUp = () => {
        cursor.release();
      };

      const onLeave = (event) => {
        let item = state[StateTypes.hovered];

        if (event?.target === item) {
          if (item) {
            ro.current.unobserve(item);
            item.removeEventListener('pointerdown', onDown, true);
            document.removeEventListener('pointerup', onUp, true);
          }

          item = item?.parentNode;
          while (item && item.tabIndex < 0) {
            item = item.parentNode;
          }

          if (item === document) {
            item = null;
          }

          cursor.focusOn(item);
        }

        state[StateTypes.hovered] = item;
      };

      const onBlur = () => {
        let item = state[StateTypes.focused];

        if (item) {
          ro.current.unobserve(item);
        }

        item = null;
        focus.focusOn();
        focus.hide();

        state[StateTypes.focused] = item;
      };

      document.addEventListener('focus', onFocus, true);
      document.addEventListener('blur', onBlur, true);
      document.addEventListener('pointerenter', onEnter, true);
      document.addEventListener('pointerleave', onLeave, true);

      return () => {
        if (state[StateTypes.hovered]) {
          state[StateTypes.hovered].removeEventListener('pointerdown', onDown, true);
          document.removeEventListener('pointerup', onUp, true);
        }

        document.removeEventListener('focus', onFocus, true);
        document.removeEventListener('blur', onBlur, true);
        document.removeEventListener('pointerenter', onEnter, true);
        document.removeEventListener('pointerleave', onLeave, true);
      };
    },
    [globalListener],
  );

  return null;
};

FocusOverlay.propTypes = {
  globalListener: PropTypes.bool,
};

FocusOverlay.defaultProps = {
  globalListener: true,
};

export default FocusOverlay;
