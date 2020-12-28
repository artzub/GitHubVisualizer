import React from 'react';
import slice from '@/redux/modules/profiles';
import { Avatar } from "@material-ui/core";
import LinkOrigin from "@material-ui/core/Link";
import GithubIcon from "mdi-react/GithubIcon";
import LinkVariantIcon from "mdi-react/LinkVariantIcon";
import SourceRepositoriesIcon from "mdi-react/SourceRepositoriesIcon";
import { useSelector } from "react-redux";
import styled from "styled-components";

const Container = styled.button`
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
  
  transition: background 0.3s;
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
`;

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
  }
`;

const PropertyValue = styled.div`
  margin-left: 2px;
`;

const Header = (props) => {
  const { profile } = useSelector(slice.selectors.getState);

  return (
    <Container {...props}>
      <Avatar src={profile?.avatar_url} />
      <InfoContainer>
        {!profile && <div>Find a user</div>}
        {profile && (
          <React.Fragment>
            <Title>{profile.name || profile.login}</Title>
            <Properties>
              <Property>
                <GithubIcon size={16} />
                <PropertyValue>
                  <Link href={profile.html_url}>{profile.login}</Link>
                </PropertyValue>
              </Property>
            </Properties>
            <Properties>
              <Property title="Amount of repositories">
                <SourceRepositoriesIcon size={16} />
                <PropertyValue>{profile.public_repos}</PropertyValue>
              </Property>
              {profile.blog && (
                <Property title="Web site">
                  <LinkVariantIcon size={16} />
                  <PropertyValue>
                    <Link href={profile.blog}>blog</Link>
                  </PropertyValue>
                </Property>
              )}
            </Properties>
          </React.Fragment>
        )}
      </InfoContainer>
    </Container>
  );
};

export default Header;
