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

  const { key, state } = location;
  const { from } = state || {};

  const navType = useNavigationType();

  const navigate = useNavigate();
  const parent = useResolvedPath(`${path}/..`);

  const onClose = useEventCallback((event, reason) => {
    if (reason !== 'closeButton') {
      return;
    }

    if (navType !== 'REPLACE' && key !== 'default') {
      navigate(-1);
      return;
    }

    navigate(from || parent.pathname, { replace: true });
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      {...tail}
    />
  );
};

RouteModal.propTypes = {
  path: PropTypes.string.isRequired,
};

export default RouteModal;
