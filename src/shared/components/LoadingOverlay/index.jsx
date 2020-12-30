import React from 'react';
import { CircularProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  min-height: 50px;
`;

const Overlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: rgba(0, 0, 0, 0.1);
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const Loading = ({ className, loading, ...rest }) => (
  // eslint-disable-next-line react/forbid-component-props
  <Container className={className}>
    {loading && (
      <Overlay>
        <CircularProgress />
      </Overlay>
    )}
    <div {...rest} />
  </Container>
);

Loading.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
};

Loading.defaultProps = {
  className: '',
  loading: false,
};

export default Loading;
