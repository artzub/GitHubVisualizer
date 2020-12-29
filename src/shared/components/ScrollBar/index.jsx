import 'react';
import styled, { css } from 'styled-components';

export const ScrollBarMixin = css`
  border-color: rgba(0, 0, 0, 0.0);
  transition: border-color 0.5s;
  :hover {
    border-color: rgba(0, 0, 0, 0.2);
  }

  ::-webkit-scrollbar-thumb,
  ::-webkit-scrollbar-corner {
    /* add border to act as background-color */
    border-right-style: inset;
    /* sum viewport dimensions to guarantee border will fill scrollbar */
    border-right-width: calc(100vw + 100vh);
    /* inherit border-color to inherit transitions */
    border-color: inherit;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
  }
  ::-webkit-scrollbar-thumb:hover {
    border-color: rgba(0, 0, 0, 0.3);
  }
  ::-webkit-scrollbar-thumb:active {
    border-color: rgba(0, 0, 0, 0.4);
  }
`;

const ScrollBar = styled.div`
  ${ScrollBarMixin}
`;

export default ScrollBar;
