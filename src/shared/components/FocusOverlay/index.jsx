import React, { useContext, useEffect, useRef, useState } from 'react';
import Portal from '@/shared/components/Portal';
import PropTypes from 'prop-types';
import { install, ResizeObserver } from 'resize-observer';
import styled from 'styled-components';
import Context from './Context';

if (!window.ResizeObserver) {
  install();
}

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

const Border = styled.div.attrs(({ $x, $y }) => ({
  style: {
    transform: $x != null && $y != null ? `translate3d(${$x}px, ${$y}px, 1px)` : null,
  },
}))`
  position: absolute;
  top: -5px;
  left: -5px;
  transform: translate3d(-20px, -20px, 1px);
  transition: transform 0.1s;
  border: 1px solid transparent;
  width: 10px;
  height: 10px;
  z-index: 2;
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

const Inside = styled(Border).attrs(({ $x, $y, $width, $height }) => ({
  style: {
    width: `${$width ?? 0}px`,
    height: `${$height ?? 0}px`,
    transform: $x != null && $y != null ? `translate3d(${$x}px, ${$y}px, 1px)` : null,
  },
}))`
  display: none;
  z-index: 1;
  transition: transform 0.1s, width 0.1s, height 0.1s;
  border-color: rgba(255, 255, 255, 0.1); 
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
`;

const FocusOverlay = ({ globalListener }) => {
  const {
    visible, show, hide, rect,
    press, release, pressed,
  } = useContext(Context) || {};
  const roCallback = useRef();
  const [inside, setInside] = useState({});
  const [leftTop, setLeftTop] = useState({});
  const [leftBottom, setLeftBottom] = useState({});
  const [rightTop, setRightTop] = useState({});
  const [rightBottom, setRightBottom] = useState({});

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

      let current;
      let _pressed;

      roCallback.current = (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== current) {
            entries.forEach((entry) => ro.current.unobserve(entry.target));
          } else {
            show(current);
          }
        });
      };

      const onFocus = (event) => {
        if (_pressed) {
          return;
        }

        if (event?.target?.tabIndex > -1) {
          if (current) {
            current.removeEventListener('pointerdown', onDown, true);
            document.removeEventListener('pointerup', onUp, true);
            ro.current.unobserve(current);
          }

          if (current !== event.target) {
            current = event.target;
            show(current);
          }

          ro.current.observe(current);

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
        // event?.target?.tabIndex > -1 &&
        if (event?.target === current) {
          if (current) {
            ro.current.unobserve(current);
            current.removeEventListener('pointerdown', onDown, true);
            document.removeEventListener('pointerup', onUp, true);
          }

          current = current?.parentNode;
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

      setInside({
        $x: item.left + (pressed ? 4 : 0),
        $y: item.top + (pressed ? 4 : 0),
        $width: rect.width + 10 + (pressed ? -4 : 0),
        $height: rect.height + 10 + (pressed ? -4 : 0),
      });
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
        <Inside {...inside} />
        <BorderLeftTop {...leftTop} />
        <BorderLeftBottom {...leftBottom} />
        <BorderRightTop {...rightTop} />
        <BorderRightBottom {...rightBottom} />
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
