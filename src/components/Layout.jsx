import React from 'react';
import Header from '@/components/Header';
import Progress from '@/components/Progress';
import StageController from '@/components/StageController';
import Visualization from '@/components/Visualization';

const Layout = () => (
  <React.Fragment>
    <StageController />
    <Visualization />
    <Progress />
    <Header />
  </React.Fragment>
);

export default Layout;
