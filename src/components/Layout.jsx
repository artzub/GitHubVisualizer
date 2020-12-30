import React from 'react';
import Header from '@/components/Header';
import Main from '@/components/Main';
import Progress from '@/components/Progress';
import StageController from '@/components/StageController';

const Layout = () => (
  <React.Fragment>
    <StageController />
    <Progress />
    <Header />
    <Main />
  </React.Fragment>
);

export default Layout;
