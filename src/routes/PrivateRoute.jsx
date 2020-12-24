import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

const PrivateRoute = (props) => {
  const { render, component: Component, ...rest } = props;

  const routeRender = useCallback(
    (routeProps) => Component ? <Component {...routeProps} /> : render(routeProps),
    [Component, render],
  );

  return (
    <Route
      {...rest}
      render={routeRender}
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.object,
  ]),
  render: PropTypes.func,
};

PrivateRoute.defaultProps = {
  component: null,
  render: () => {},
};

export default PrivateRoute;
