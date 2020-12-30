import styled from 'styled-components';

const HeaderContainer = styled.button`
  display: flex;
  box-sizing: border-box;
  padding: 5px;
  font-size: 0.8em;
  align-items: center;
  flex: 1 1 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  color: inherit;
  cursor: pointer;
  overflow: hidden;
  
  transition: background 0.3s, opacity 0.5s;
  outline: 0;
  
  &:focus-visible {
    outline: -webkit-focus-ring-color auto 1px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.4;
  }
`;

export default HeaderContainer;
