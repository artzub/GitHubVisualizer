import React from 'react';
import capitalize from '@material-ui/core/utils/capitalize';
import AlertCircleOutlineIcon from 'mdi-react/AlertCircleOutlineIcon';
import CodeTagsIcon from 'mdi-react/CodeTagsIcon';
import EyeOutlineIcon from 'mdi-react/EyeOutlineIcon';
import SourceForkIcon from 'mdi-react/SourceForkIcon';
import StarIcon from 'mdi-react/StarIcon';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import GithubEmoji from '@/shared/components/GithubEmoje';
import Properties from '../shared/Properties';
import Property from '../shared/Property';
import PropertyValue from '../shared/PropertyValue';

const SecondaryContainer = styled.span`
  display: flex;
  flex-direction: column;
`;

const Description = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Secondary = ({ item }) => (
  <SecondaryContainer>
    {item.description && (
      <Description title={item.description}>
        <GithubEmoji text={item.description} />
      </Description>
    )}
    <Properties>
      {item.language && (
        <Property title="Forks">
          <CodeTagsIcon size={16} />
          <PropertyValue>
            {capitalize(item.language)}
          </PropertyValue>
        </Property>
      )}
      <Property title="Forks">
        <SourceForkIcon size={16} />
        <PropertyValue>
          {item.forks}
        </PropertyValue>
      </Property>
      <Property title="Stars">
        <StarIcon size={16} />
        <PropertyValue>
          {item.stars}
        </PropertyValue>
      </Property>
      <Property title="Watchers">
        <EyeOutlineIcon size={16} />
        <PropertyValue>
          {item.watchers}
        </PropertyValue>
      </Property>
      <Property title="Opened issues">
        <AlertCircleOutlineIcon size={16} />
        <PropertyValue>
          {item.openIssues}
        </PropertyValue>
      </Property>
    </Properties>
  </SecondaryContainer>
);

Secondary.propTypes = {
  item: PropTypes.shape().isRequired,
};

export default Secondary;
