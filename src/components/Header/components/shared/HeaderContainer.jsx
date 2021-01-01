import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.button`
  position: relative;
  display: flex;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  font-size: 0.8em;
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 0;
  color: inherit;
  overflow: hidden;
  cursor: pointer;
  
  outline: 0;
  &:focus-visible {
    outline: -webkit-focus-ring-color auto 1px;
  }

  &:disabled {
    pointer-events: none;
  }
  
  &.notAction {
    cursor: default;
  }
`;

const Children = styled.div`
  position: relative;
  display: flex;
  height: 100%;
  box-sizing: border-box;
  padding: 5px;
  align-items: center;
  transition: background 0.3s, opacity 0.5s;
  flex: 1 1 0;
  overflow: hidden;
  background: transparent;
  
  ${Container}.notAction &:not(#fake_id_hack) {
    background: transparent;
  }

  ${Container}:hover:not(:disabled) & {
    background: rgba(255, 255, 255, 0.1);
  }

  ${Container}:active:not(:disabled) & {
    background: rgba(255, 255, 255, 0.2);
  }

  ${Container}:disabled & {
    opacity: 0.4;
  }
`;

const Divider = styled.div`
  position: relative;
  padding: 5px;
  flex-shrink: 0;
  max-width: 10px;
  min-width: 10px;
  height: 100%;
  overflow: hidden;
  //background: #fff;
  
  :after {
    position: absolute;
    top: 50%;
    left: 50%;
    content: '';
    width: 80px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    height: 80px;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
    transform: scale(0.3, 1)translate(calc(-200% - 16px), -50%)rotate(45deg);
    background: transparent;
    transition: background 0.3s;
  }

  ${Container}:hover:not(:disabled) &:after {
    background: rgba(255, 255, 255, 0.1);
  }

  ${Container}:active:not(:disabled) &:after {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderContainer = ({ divider, children, ...rest }) => {
  return (
    <Container type="button" {...rest}>
      <Children>{children}</Children>
      {divider && <Divider />}
    </Container>
  );
};

HeaderContainer.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  divider: PropTypes.bool,
};

HeaderContainer.defaultProps = {
  children: [],
  divider: false,
};

export default HeaderContainer;
