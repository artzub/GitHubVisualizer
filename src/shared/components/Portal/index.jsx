import { useEffect, useMemo, useState } from 'react';

import PortalMUI from '@mui/material/Portal';

const Portal = ({ children, inBody }) => {
  const [container, setContainer] = useState();

  useEffect(
    () => {
      if (inBody) {
        setContainer(null);
        return undefined;
      }

      const element = document.createElement('div');
      document.body.append(element);

      setContainer(element);
      return () => {
        setContainer(null);
        element.remove();
      };
    },
    [inBody],
  );

  return useMemo(
    () => (inBody || Boolean(container)) && (
      <PortalMUI container={inBody ? document.body : container}>
        {children}
      </PortalMUI>
    ),
    [children, container, inBody],
  );
};

export default Portal;
