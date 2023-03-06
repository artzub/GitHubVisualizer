import styled from 'styled-components';

export const ModalRoot = styled.div.attrs({ id: 'modalRoot' })`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  pointer-events: none;
  z-index: 8888;
`;
