import React from 'react';
import Cursor from '@/components/Cursor';
import Header from '@/components/Header';
import Progress from '@/components/Progress';
import StageController from '@/components/StageController';
import Visualization from '@/components/Visualization';
import FocusOverlay from '@/shared/components/FocusOverlay';

const Layout = () => (
  <React.Fragment>
    <StageController />
    <Visualization />
    <Progress />
    <Header />
    <FocusOverlay />
    <Cursor />
  </React.Fragment>
);

export default Layout;
