import styled, { keyframes } from 'styled-components';

import Container from './Container';

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

export default Tab;
