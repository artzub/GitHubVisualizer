import React, { forwardRef } from 'react';
import slice from '@/redux/modules/branches';
import HistoryIcon from 'mdi-react/HistoryIcon';
import SourceBranchIcon from 'mdi-react/SourceBranchIcon';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Container from '../shared/HeaderContainer';
import InfoContainer from '../shared/InfoContainer';
import PropertiesOrigin from '../shared/Properties';
import Property from '../shared/Property';
import PropertyValue from '../shared/PropertyValue';
import Title from '../shared/Title';

const Properties = styled(PropertiesOrigin)`
  font-size: 1em;
`;

const Header = forwardRef((props, ref) => {
  const { selected } = useSelector(slice.selectors.getState);
  const { name, commits } = selected || {};

  return (
    <Container {...props} ref={ref}>
      <SourceBranchIcon size={20} />
      <InfoContainer>
        {!selected && <div>Choose a branch</div>}
        {selected && (
          <Properties>
            <Property style={{ overflow: 'hidden' }}>
              <Title title={name}>{name}</Title>
            </Property>
            <Property title="Commits">
              <HistoryIcon size={16} />
              <PropertyValue>
                {commits}
              </PropertyValue>
            </Property>
          </Properties>
        )}
      </InfoContainer>
    </Container>
  );
});

Header.displayName = 'Header';

export default Header;
