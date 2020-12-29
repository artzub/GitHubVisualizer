import React from 'react';
import slice from '@/redux/modules/repositories';
import SourceRepositoryIcon from "mdi-react/SourceRepositoryIcon";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Container from '../shared/HeaderContainer';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 5px;
`;

const Title = styled.div`
  font-weight: bold;
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const Header = (props) => {
  const { selected } = useSelector(slice.selectors.getState);
  const { name } = selected || {};

  return (
    <Container {...props}>
      <SourceRepositoryIcon />
      <InfoContainer>
        {!selected && <div>Choice a repository</div>}
        {selected && (
          <Title>{name}</Title>
        )}
      </InfoContainer>
    </Container>
  );
};

export default Header;
