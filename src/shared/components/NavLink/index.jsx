import { forwardRef } from 'react';
import { NavLink as NavLinkOrigin } from 'react-router-dom';

import Link from '@mui/material/Link';

const NavLink = forwardRef((props, ref) => {
  return (
    <Link
      {...props}
      component={NavLinkOrigin}
      ref={ref}
    />
  );
});

export default NavLink;
