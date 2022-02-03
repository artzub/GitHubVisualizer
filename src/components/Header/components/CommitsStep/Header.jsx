import React, { forwardRef } from 'react';
import PollIcon from 'mdi-react/PollIcon';
import styled from 'styled-components';
import HeaderContainer from '../shared/HeaderContainer';

const Container = styled(HeaderContainer)`
  & > div:first-child {
    justify-content: center;
  }
`;

const Header = forwardRef((props, ref) => {
  return (
    <Container {...props} title="Analyze commits" ref={ref}>
      <PollIcon size={32} />
    </Container>
  );
});

Header.displayName = 'Header';

export default Header;
