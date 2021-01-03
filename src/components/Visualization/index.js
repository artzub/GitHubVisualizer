import React, { useMemo, useRef } from 'react';
import { StageTypes } from '@/models/StageTypes';
import { useUIProperty } from '@/shared/hooks';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const left = keyframes`
  0% {
    transform: translate3d(-100%, 0, 0);
    z-index: 2;
  }
  100% {
    transform: translate3d(0, 0, 0);
    z-index: 3;
  }
`;

const right = keyframes`
  0% {
    transform: translate3d(100%, 0, 0);
    z-index: 2;
  }
  100% {
    transform: translate3d(0, 0, 0);
    z-index: 3;
  }
`;

const leftRev = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
    z-index: 3;
  }
  100% {
    transform: translate3d(-100%, 0, 0);
    z-index: 2;
  }
`;

const rightRev = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
    z-index: 3;
  }
  100% {
    transform: translate3d(100%, 0, 0);
    z-index: 2;
  }
`;

const Tab = styled(Container)`
  background: ${({ theme }) => theme.palette.background.default};
  z-index: 1;
  transform: translate3d(100%, 0, 0);
  
  animation-name: ${({ $active, $prev, $dir }) => {
    if ($active) {
      return $dir > 0 ? right : left;
    }

    if ($prev) {
      return $dir > 0 ? leftRev : rightRev;
    }
    
    return 'none';
  }};
  animation-timing-function: ease-in;
  animation-duration: 1s;
  animation-fill-mode: forwards;
`;

const Order = {
  [StageTypes.profile]: 0,
  [StageTypes.repository]: 1,
  [StageTypes.show]: 2,
};

const Visualization = () => {
  const [stage] = useUIProperty('view', StageTypes.profile);
  const prev = useRef(stage);

  const [dir, from] = useMemo(
    () => {
      const last = prev.current;
      const dir = Order[stage] - Order[prev.current];

      prev.current = stage;

      return [dir, last];
    },
    [stage],
  );

  return (
    <Container>
      <Tab
        $active={stage === StageTypes.profile}
        $prev={from === StageTypes.profile}
        $dir={dir}
      >
        {StageTypes.profile}
      </Tab>
      <Tab
        $active={stage === StageTypes.repository}
        $prev={from === StageTypes.repository}
        $dir={dir}
      >
        {StageTypes.repository}
      </Tab>
      <Tab
        $active={stage === StageTypes.show}
        $prev={from === StageTypes.show}
        $dir={dir}
      >
        {StageTypes.show}
      </Tab>
    </Container>
  );
};

export default Visualization;
