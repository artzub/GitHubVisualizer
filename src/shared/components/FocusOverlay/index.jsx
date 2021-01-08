import React, { useContext, useEffect, useState } from 'react';
import Portal from '@/shared/components/Portal';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Context from './Context';

const PortalContainer = styled.div.attrs(({ $visible }) => ({
  style: {
    opacity: Number($visible ?? 0),
  },
}))`
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: opacity 0.1s;
`;

const Border = styled.div.attrs(({ $x, $y, $visible }) => ({
  style: {
    transform: $x != null && $y != null ? `translate3d(${$x}px, ${$y}px, 1px)` : null,
    // transitionDelay: $visible ? null : '2s',
    // transitionDuration: $visible ? null : '2s',
  },
}))`
  position: absolute;
  top: -5px;
  left: -5px;
  transform: translate3d(-20px, -20px, 1px);
  transition: transform;
  transition-duration: 0.1s;
  border-style: solid;
  border-width: 1px;
  border-color: transparent;
  width: 10px;
  height: 10px;
`;

const BorderLeftTop = styled(Border)`
  transform: translate3d(-20px, -20px, 1px);
  border-top-color: white;
  border-left-color: white;
`;

const BorderLeftBottom = styled(Border)`
  transform: translate3d(-20px, calc(100vh + 20px), 1px);
  border-bottom-color: white;
  border-left-color: white;
`;

const BorderRightTop = styled(Border)`
  transform: translate3d(calc(100vw + 20px), -20px, 1px);
  border-top-color: white;
  border-right-color: white;
`;

const BorderRightBottom = styled(Border)`
  transform: translate3d(calc(100vw + 20px), calc(100vh + 20px), 1px);
  border-bottom-color: white;
  border-right-color: white;
`;

const FocusOverlay = ({ globalListener }) => {
  const {
    visible, show, hide, rect,
    press, release, pressed,
  } = useContext(Context) || {};
  const [leftTop, setLeftTop] = useState({});
  const [leftBottom, setLeftBottom] = useState({});
  const [rightTop, setRightTop] = useState({});
  const [rightBottom, setRightBottom] = useState({});

  useEffect(
    () => {
      if (!globalListener) {
        return undefined;
      }

      let current;
      let _pressed;

      const onFocus = (event) => {
        if (_pressed) {
          return;
        }

        if (event?.target?.tabIndex > -1 && current !== event.target) {
          current = event.target;
          show(current);
          current.addEventListener('pointerdown', onDown, true);
          document.addEventListener('pointerup', onUp, true);
        } else if (current === event.target) {
          current.addEventListener('pointerdown', onDown, true);
          document.addEventListener('pointerup', onUp, true);
        }
      };

      const onDown = (event) => {
        press();
        _pressed = true;
      };

      const onUp = (event) => {
        if (_pressed) {
          release();
          _pressed = false;
        }
      };

      const onBlur = (event) => {
        if (_pressed) {
          return;
        }
        if (event?.target?.tabIndex > -1) {
          if (current) {
            current.removeEventListener('pointerdown', onDown, true);
            document.removeEventListener('pointerup', onUp, true);
          }

          current = current.parentNode;
          while (current && current.tabIndex < 0) {
            current = current.parentNode;
          }

          if (current === document) {
            current = null;
          }

          if (!current && document.activeElement && document.activeElement !== document.body) {
            current = document.activeElement;
          }

          if (current) {
            show(current);
          } else {
            hide();
          }
        }
      };

      document.addEventListener('focus', onFocus, true);
      document.addEventListener('blur', onBlur, true);
      document.addEventListener('pointerenter', onFocus, true);
      document.addEventListener('pointerleave', onBlur, true);

      return () => {
        _pressed = false;
        if (current) {
          current.removeEventListener('pointerdown', onDown, true);
          document.removeEventListener('pointerup', onUp, true);
        }
        document.removeEventListener('focus', onFocus, true);
        document.removeEventListener('blur', onBlur, true);
        document.removeEventListener('pointerenter', onFocus, true);
        document.removeEventListener('pointerleave', onBlur, true);
      };
    },
    [show, hide, press, release, globalListener],
  );

  useEffect(
    () => {
      const item = rect;
      if (!item) {
        return;
      }

      setLeftTop({
        $x: item.left + (pressed ? 4 : 0),
        $y: item.top + (pressed ? 4 : 0),
      });
      setLeftBottom({
        $x: item.left + (pressed ? 4 : 0),
        $y: item.bottom + (pressed ? -4 : 0),
      });
      setRightTop({
        $x: item.right + (pressed ? -4 : 0),
        $y: item.top + (pressed ? 4 : 0),
      });
      setRightBottom({
        $x: item.right + (pressed ? -4 : 0),
        $y: item.bottom + (pressed ? -4 : 0),
      });
    },
    [rect, pressed],
  );

  return (
    <Portal inBody>
      <PortalContainer $visible={visible}>
        <BorderLeftTop {...leftTop} $visible={visible} />
        <BorderLeftBottom {...leftBottom} $visible={visible} />
        <BorderRightTop {...rightTop} $visible={visible} />
        <BorderRightBottom {...rightBottom} $visible={visible} />
      </PortalContainer>
    </Portal>
  );
};

FocusOverlay.propTypes = {
  globalListener: PropTypes.bool,
};

FocusOverlay.defaultProps = {
  globalListener: true,
};

export default FocusOverlay;
