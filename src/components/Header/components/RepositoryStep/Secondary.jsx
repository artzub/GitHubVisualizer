import React from "react";
import GithubEmoji from "@/shared/components/GithubEmoje";
import capitalize from "@material-ui/core/utils/capitalize";
import AlertCircleOutlineIcon from "mdi-react/AlertCircleOutlineIcon";
import CodeTagsIcon from "mdi-react/CodeTagsIcon";
import EyeOutlineIcon from "mdi-react/EyeOutlineIcon";
import SourceForkIcon from "mdi-react/SourceForkIcon";
import StarIcon from "mdi-react/StarIcon";
import PropTypes from 'prop-types';
import styled from "styled-components";

const SecondaryContainer = styled.span`
  display: flex;
  flex-direction: column;
`;

const Description = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Properties = styled.span`
  display: flex;
  align-items: center;
  font-size: 0.8em;
`;

const Property = styled.span`
  display: flex;
  align-items: center;
  margin-left: 5px;
  padding-right: 5px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    border-right: 0;
    padding-right: 0;
  }

  color: #fff;
`;

const PropertyValue = styled.span`
  margin-left: 5px;
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
          {item.stargazers_count}
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
          {item.open_issues}
        </PropertyValue>
      </Property>
    </Properties>
  </SecondaryContainer>
);

Secondary.propTypes = {
  item: PropTypes.shape().isRequired,
};

export default Secondary;
