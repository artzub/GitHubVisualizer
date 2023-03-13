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
  const { path, ...tail } = props;

  const location = useLocation();

  const { from } = location.state || {};

  const navType = useNavigationType();

  const navigate = useNavigate();
  const { pathname } = useResolvedPath(path);
  const parent = useResolvedPath(`${path}/..`);

  const onClose = useEventCallback((event, reason) => {
    if (reason !== 'closeButton') {
      return;
    }

    if (navType !== 'REPLACE' && location.key !== 'default') {
      navigate(-1);
      return;
    }

    navigate(from || parent.pathname, { replace: true });
  });

  return (
    <Modal
      isOpen
      isCloseShown={pathname === location.pathname}
      onClose={onClose}
      {...tail}
    />
  );
};

RouteModal.propTypes = {
  path: PropTypes.string.isRequired,
};

export default RouteModal;
