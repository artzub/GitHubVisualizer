import React from 'react';
import PollIcon from 'mdi-react/PollIcon';
import HeaderContainer from '../shared/HeaderContainer';

const Header = (props) => {
  return (
    <HeaderContainer {...props} title="Analyze commits">
      <PollIcon size={32} />
    </HeaderContainer>
  );
};

export default Header;
