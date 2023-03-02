import { useEffect, useState } from 'react';

import styled from 'styled-components';

import Application from './Application';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 9999;
`;

const Cursor = () => {
  const [container, setContainer] = useState(null);

  useEffect(
    () => {
      if (!container) {
        return;
      }
      const instance = new Application(container);

      return () => {
        instance.destroy();
      };
    },
    [container],
  );

  return (
    <Container ref={setContainer} />
  );
};

export default Cursor;