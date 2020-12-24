import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import styled from 'styled-components';
import StepsBar from './StepsBar';
import UserBar from './UserBar';

const Stretcher = styled.div`
    flex-grow: 1;
`;

const Header = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <StepsBar />
        <Stretcher />
        <UserBar />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
