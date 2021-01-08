import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Provider as ProviderOrigin } from './Context';

const initialState = {
  visible: false,
};

const Provider = (props) => {
  const { value, ...rest } = props;
  const [state, setState] = useState(initialState);

  const show = useCallback(
    (element) => {
      const rect = element?.getBoundingClientRect();
      setState((prev) => ({
        ...prev,
        visible: true,
        pressed: false,
        rect,
      }));
    },
    [],
  );

  const hide = useCallback(
    () => {
      setState((prev) => ({
        ...prev,
        rect: null,
        visible: false,
        pressed: false,
      }));
    },
    [],
  );

  const press = useCallback(
    () => {
      setState((prev) => ({
        ...prev,
        pressed: true,
      }));
    },
    [],
  );

  const release = useCallback(
    () => {
      setState((prev) => ({
        ...prev,
        pressed: false,
      }));
    },
    [],
  );

  useEffect(
    () => {
      setState({
        ...initialState,
        ...value,
        show,
        hide,
        press,
        release,
      });
    },
    [hide, press, release, show, value],
  );

  return (
    <ProviderOrigin value={state} {...rest} />
  );
};

Provider.propTypes = {
  value: PropTypes.shape({}),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

Provider.defaultProps = {
  value: initialState,
};

export default Provider;
