import React from 'react';
import ContainerOriginal from '@material-ui/core/Container';
import { withStyles } from '@material-ui/core/styles';

const Container = withStyles({
  root: {
    paddingTop: '64px',
  },
})(ContainerOriginal);

const Main = () => (
  <Container disableGutters fixed />
);

export default Main;
