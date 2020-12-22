import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import GitHub from '@material-ui/icons/GitHub';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Link } from 'react-router-dom';

const Container = styled.div`
`;

const UserBar = () => {
  const [anchor, setAnchor] = useState(null);
  const opened = Boolean(anchor);

  const handleMenu = useCallback(
    ({ currentTarget }) => setAnchor(currentTarget),
    [],
  );

  const handleClose = useCallback(
    () => setAnchor(null),
    [],
  );

  return (
    <Container>
      <IconButton
        aria-controls="menu-appbar"
        aria-haspopup="true"
        aria-label="account of current user"
        color="inherit"
        onClick={handleMenu}
      >
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        onClose={handleClose}
        open={opened}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem component={Link} to="/signin">
          <ListItemIcon>
            <GitHub fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign In with GitHub" />
        </MenuItem>
        <MenuItem component={Link} to="/signout">
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out from GitHub" />
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default UserBar;
