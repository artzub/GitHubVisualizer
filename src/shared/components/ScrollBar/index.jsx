import 'react';
import Scroll from 'react-smooth-scrollbar';
import styled from 'styled-components';

// background: ${(props) => props.theme.scrollBackgroundColor};

const ScrollBar = styled(Scroll)`
  .scrollbar-track {
    background: transparent;
    transition: opacity 0.3s;
  }
  &:hover .scrollbar-track {
    opacity: 1;
  }

  .scrollbar-track-x {
    height: 8px;
  }
  .scrollbar-track-y {
    width: 8px;
  }

  .scrollbar-thumb {
    // TODO background scrollBackgroundColor
  }

  .scrollbar-thumb-x {
    height: 4px;
    top: 50%;
    margin-top: -2px;

    transition: height 0.3s, margin-top 0.3s;
    &:hover,
    &:active {
      height: 8px;
      margin-top: -4px;
    }
  }
  .scrollbar-thumb-y {
    width: 4px;
    left: 50%;
    margin-left: -2px;

    transition: width 0.3s, margin-left 0.3s;
    &:hover,
    &:active {
      width: 8px;
      margin-left: -4px;
    }
  }
`;

export default ScrollBar;
