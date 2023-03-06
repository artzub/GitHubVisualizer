import PropTypes from 'prop-types';

import styled from 'styled-components';

import IconButton from '@mui/material/IconButton';
import ModalOrigin from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';

import CloseIcon from 'mdi-react/CloseIcon';

const ModalStyled = styled(ModalOrigin)`
  .MuiBackdrop-root {
    background: rgba(0, 0, 0, 0.3);
  }

  *:focus-visible {
    outline: none;
  }
`;

const Container = styled(Paper)`
  position: relative;
  max-width: 70vw;
  //min-width: 30vw;
  border-radius: 0;
  display: flex;
  justify-content: center;
  padding: 40px;
  background-image: none;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  min-width: 20vw;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 15px;
  left: -50px;
`;

const sxStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  pointerEvents: 'auto',
  cursor: 'none',
};

const getModalContainer = () => {
  if (!getModalContainer.element) {
    getModalContainer.element = document.querySelector('#modalRoot');
  }
  return getModalContainer.element || document.body;
};

export const Modal = (props) => {
  const { children, isOpen, onClose, onEntered, ...tail } = props;

  return (
    <ModalStyled
      closeAfterTransition
      {...tail}
      open={isOpen}
      onClose={onClose}
      sx={sxStyle}
      container={getModalContainer}
    >
      <Slide
        in={isOpen}
        direction="left"
        onEntered={onEntered}
      >
        <Container elevation={3}>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
          <Content>{children}</Content>
        </Container>
      </Slide>
    </ModalStyled>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onEntered: PropTypes.func,
};

Modal.defaultProps = {
  onEntered: null,
  onClose: null,
};
