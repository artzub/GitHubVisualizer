/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StageTypes } from '@/models/StageTypes';
import commits from '@/redux/modules/commits';
import { useUIProperty } from '@/shared/hooks';
import { teal } from '@material-ui/core/colors';
import { useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  display: flex;
  width: 100%;
  cursor: none;
`;

const Tab = styled.button`
  text-transform: uppercase;
  position: relative;
  border: 0;
  font-size: 12px;
  color: ${({ $active }) => teal[$active ? 200 : 700]};
  padding: 3px 6px;
  padding-right: ${({ $notDivider }) => $notDivider ? null : '10px'};
  outline: 0;
  cursor: ${({ $active }) => $active ? 'default' : 'pointer'};
  background: transparent;
  flex: 1 1 0;
  
  transition: opacity 0.3s, color 0.3s;
  &:hover:not(:disabled) {
    color: ${({ $active }) => teal[$active ? 200 : 400]};
  }
  &:active:not(:disabled) {
    color: ${({ $active }) => teal[$active ? 200 : 100]};
  }

  pointer-events: ${({ $active }) => $active ? 'none' : null};
  
  &:disabled {
    color: #888888;
    cursor: default;
    pointer-events: none;
  }
  
  &:before {
    content: '';
    position: absolute;
    right: 9.5px;
    top: 0;
    bottom: 0;
    width: 2px;
    border-right: ${({ $notDivider }) => $notDivider ? null : '1px solid rgba(0,0,0,0.3)'};
    box-shadow: ${({ $notDivider }) => $notDivider ? null : '1px 0 0 0 rgba(0,0,0,0.2)'};
  }
  
  & > span {
    pointer-events: none;
  }
`;

const hide = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const show = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
`;

const Slider = styled.div.attrs(({ $width, $left, $opacity }) => ({
  style: {
    width: `${$width || 0}px`,
    transform: `translate(${$left || 0}px, 0)`,
    animationName: ($opacity ? show : hide).name,
    animationDelay: `${$opacity ? 0 : 1}s`,
  },
}))`
  position: absolute;
  bottom: 3px;
  height: 1px;
  left: 0;
  background: ${teal[200]};
  transition: width 0.3s, transform 0.3s, opacity 0.3s;
  z-index: 1;
  animation-name: ${show};
  animation-name: ${hide};
  animation-duration: 1s;
  animation-fill-mode: forwards;
`;

const Tabs = () => {
  const [view, setView] = useUIProperty('view', StageTypes.profile);
  const { items } = useSelector(commits.selectors.getState);
  const refContainer = useRef();
  const [slider, setSlider] = useState();
  const [ref, setRef] = useState();
  const [width, setWidth] = useState(0);
  const [left, setLeft] = useState(0);
  const [opacity, setOpacity] = useState(0);

  const onClick = useCallback(
    (event) => {
      setView(event.target.dataset.key);
    },
    [setView],
  );

  useEffect(
    () => {
      if (!ref || !refContainer.current) {
        return;
      }

      const parentRest = refContainer.current.getBoundingClientRect();
      const rect = ref.firstChild.getBoundingClientRect();

      setWidth(rect.width);
      setLeft(rect.left - parentRest.left);
      setOpacity(1);
    },
    [ref],
  );

  useEffect(
    () => {
      if (!slider) {
        return;
      }

      const end = () => {
        setOpacity(0);
      };

      slider.addEventListener('transitionend', end, true);

      return () => {
        end();
        if (slider) {
          slider.removeEventListener('transitionend', end, true);
        }
      };
    },
    [slider],
  );

  return (
    <Container ref={refContainer}>
      <Slider
        $width={width}
        $left={left}
        $opacity={opacity}
        ref={setSlider}
      />
      <Tab
        $active={view === StageTypes.profile}
        onClick={onClick}
        data-key={StageTypes.profile}
        style={{ maxWidth: '165px', minWidth: '165px' }}
        title="Screen profile"
        ref={view === StageTypes.profile ? setRef : null}
        tabIndex={view === StageTypes.profile ? -1 : 0}
      >
        <span>Profile</span>
      </Tab>
      <Tab
        $active={view === StageTypes.repository}
        onClick={onClick}
        data-key={StageTypes.repository}
        disabled={!items?.length}
        title="Screen repository"
        ref={view === StageTypes.repository ? setRef : null}
        tabIndex={view === StageTypes.repository ? -1 : 0}
      >
        <span>Repository</span>
      </Tab>
      <Tab
        $active={view === StageTypes.show}
        onClick={onClick}
        data-key={StageTypes.show}
        style={{ maxWidth: '74px', minWidth: '74px' }}
        $notDivider
        disabled
        title="Screen show"
        ref={view === StageTypes.show ? setRef : null}
        tabIndex={view === StageTypes.show ? -1 : 0}
      >
        <span>Show</span>
      </Tab>
    </Container>
  );
};

export default Tabs;
