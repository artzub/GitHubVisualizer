import PropTypes from 'prop-types';
import {
  useLocation,
  useNavigate,
  useNavigationType,
  useResolvedPath,
} from 'react-router-dom';

import useEventCallback from '@mui/material/utils/useEventCallback';

import Modal from '@/shared/components/Modal';

const RouteModal = (props) => {
  const { parent, onClose, ...tail } = props;

  const location = useLocation();

  const { from } = location.state || {};

  const navType = useNavigationType();

  const navigate = useNavigate();
  const { pathname } = useResolvedPath('.');
  const { pathname: parentPathname } = useResolvedPath(parent || './..');

  const doClose = useEventCallback((event, reason) => {
    if (reason !== 'closeButton') {
      return;
    }

    if (!(from || navType === 'REPLACE' || location.key === 'default')) {
      navigate(-1);
      return;
    }

    navigate(from || parentPathname, { replace: true });

    onClose?.(event, reason);
  });

  return (
    <Modal
      isOpen
      isCloseShown={pathname === location.pathname}
      {...tail}
      onClose={doClose}
    />
  );
};

RouteModal.propTypes = {
  parent: PropTypes.string,
  onClose: PropTypes.func,
};

RouteModal.defaultProps = {
  parent: null,
  onClose: null,
};

export default RouteModal;
