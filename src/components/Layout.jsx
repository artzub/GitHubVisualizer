import React from 'react';
import Header from '@/components/Header';
import Progress from '@/components/Progress';
import StageController from '@/components/StageController';
import Visualization from '@/components/Visualization';
import FocusOverlay from '@/shared/components/FocusOverlay';
import FocusOverlayProvider from '@/shared/components/FocusOverlay/Provider';

const Layout = () => (
  <FocusOverlayProvider>
    <StageController />
    <Visualization />
    <Progress />
    <Header />
    <FocusOverlay />
  </FocusOverlayProvider>
);

export default Layout;
