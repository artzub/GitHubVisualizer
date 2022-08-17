import { Fragment } from 'react';

import Cursor from '@/components/Cursor';
import Header from '@/components/Header';
import Progress from '@/components/Progress';
import StageController from '@/components/StageController';
import Visualization from '@/components/Visualization';
import FocusOverlay from '@/shared/components/FocusOverlay';

const Layout = () => (
  <Fragment>
    <StageController />
    <Visualization />
    <Progress />
    <Header />
    <FocusOverlay />
    <Cursor />
  </Fragment>
);

export default Layout;
