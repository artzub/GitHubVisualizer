import PropTypes from 'prop-types';

import styled from 'styled-components';

import HistoryIcon from 'mdi-react/HistoryIcon';

import Properties from '../shared/Properties';
import Property from '../shared/Property';
import PropertyValue from '../shared/PropertyValue';

const SecondaryContainer = styled.span`
  display: flex;
  flex-direction: column;
`;

const Secondary = ({ item }) => (
  <SecondaryContainer>
    <Properties>
      <Property title="Commits">
        <HistoryIcon size={16} />
        <PropertyValue>
          {item.commits}
        </PropertyValue>
      </Property>
    </Properties>
  </SecondaryContainer>
);

Secondary.propTypes = {
  item: PropTypes.shape().isRequired,
};

export default Secondary;
