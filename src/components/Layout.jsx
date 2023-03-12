import { Fragment } from 'react';
import { Route, Routes } from 'react-router-dom';

import Cursor from '@/components/Cursor';
import Header from '@/components/Header';
import Progress from '@/components/Progress';
import Settings from '@/components/Settings';
import StageController from '@/components/StageController';
import Visualization from '@/components/Visualization';
import FocusOverlay from '@/shared/components/FocusOverlay';
import { ModalRoot } from '@/shared/components/Modal';

const Layout = () => (
  <Fragment>
    <Routes>
      <Route
        path="settings/*"
        element={<Settings />}
      />
      <Route
        path="about"
        element={<div />}
      />
    </Routes>
    <StageController />
    <Visualization />
    <Progress />
    <Header />
    <ModalRoot />
    <FocusOverlay />
    <Cursor />
  </Fragment>
);

export default Layout;
