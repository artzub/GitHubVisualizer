import React from 'react';
import slice from '@/redux/modules/profiles';
import { Avatar } from "@material-ui/core";
import LinkOrigin from "@material-ui/core/Link";
import GithubIcon from "mdi-react/GithubIcon";
import LinkVariantIcon from "mdi-react/LinkVariantIcon";
import SourceRepositoriesIcon from "mdi-react/SourceRepositoriesIcon";
import { useSelector } from "react-redux";
import styled from "styled-components";
import HeaderContainer from '../shared/HeaderContainer';

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

const Link = styled(LinkOrigin)`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
`;

const Properties = styled.div`
  display: flex;
  align-items: center;
`;

const Property = styled.div`
  display: flex;
  align-items: center;
  padding-right: 5px;
  margin-left: 5px;
  border-right: 1px solid;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    border-right: 0;
    padding-right: 0;
  }
`;

const PropertyValue = styled.div`
  margin-left: 2px;
`;

const Header = (props) => {
  const { selected } = useSelector(slice.selectors.getState);
  const {
    avatar_url, name, login,
    html_url, public_repos, blog,
  } = selected || {};

  return (
    <HeaderContainer {...props}>
      <Avatar src={avatar_url} />
      <InfoContainer>
        {!selected && <div>Find a user</div>}
        {selected && (
          <React.Fragment>
            <Title>{name || login}</Title>
            <Properties>
              <Property>
                <GithubIcon size={16} />
                <PropertyValue>
                  <Link target="_blank" href={html_url}>{login}</Link>
                </PropertyValue>
              </Property>
            </Properties>
            <Properties>
              <Property title="Amount of repositories">
                <SourceRepositoriesIcon size={16} />
                <PropertyValue>{public_repos}</PropertyValue>
              </Property>
              {blog && (
                <Property title="Web site">
                  <LinkVariantIcon size={16} />
                  <PropertyValue>
                    <Link target="_blank" href={blog}>blog</Link>
                  </PropertyValue>
                </Property>
              )}
            </Properties>
          </React.Fragment>
        )}
      </InfoContainer>
    </HeaderContainer>
  );
};

export default Header;
