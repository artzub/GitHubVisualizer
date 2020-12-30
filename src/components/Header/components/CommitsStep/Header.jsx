import React from 'react';
import PollIcon from 'mdi-react/PollIcon';
import styled from 'styled-components';
import HeaderContainer from '../shared/HeaderContainer';

const Container = styled(HeaderContainer)`
  flex: unset;
`;

const Header = (props) => {
  return (
    <Container {...props} title="Analyze commits">
      <PollIcon size={32} />
    </Container>
  );
};

export default Header;
