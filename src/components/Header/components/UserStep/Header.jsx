import React from 'react';
import slice from '@/redux/modules/profiles';
import { Avatar } from '@material-ui/core';
import LinkOrigin from '@material-ui/core/Link';
import BookMultipleIcon from 'mdi-react/BookMultipleIcon';
import GithubIcon from 'mdi-react/GithubIcon';
import LinkVariantIcon from 'mdi-react/LinkVariantIcon';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import HeaderContainer from '../shared/HeaderContainer';
import InfoContainer from '../shared/InfoContainer';
import PropertiesOrigin from '../shared/Properties';
import Property from '../shared/Property';
import PropertyValue from '../shared/PropertyValue';
import Title from '../shared/Title';

const Container = styled(HeaderContainer)`
  & > div:first-child {
    padding-left: 8px;
  }
`;

const Link = styled(LinkOrigin)`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
`;

const Properties = styled(PropertiesOrigin)`
  font-size: 1em;
`;

const onClick = (event) => event.stopPropagation();

const Header = (props) => {
  const { selected } = useSelector(slice.selectors.getState);
  const {
    avatar_url, name, login,
    html_url, public_repos, blog,
  } = selected || {};

  return (
    <Container {...props}>
      <Avatar src={avatar_url} />
      <InfoContainer>
        {!selected && <div>Find a user</div>}
        {selected && (
          <React.Fragment>
            <Title title={name || login}>{name || login}</Title>
            <Properties>
              <Property>
                <GithubIcon size={16} />
                <PropertyValue>
                  <Link
                    target="_blank"
                    onClick={onClick}
                    href={html_url}
                  >
                    {login}
                  </Link>
                </PropertyValue>
              </Property>
            </Properties>
            <Properties>
              <Property title="Amount of repositories">
                <BookMultipleIcon size={16} />
                <PropertyValue>{public_repos}</PropertyValue>
              </Property>
              {blog && (
                <Property title="Web site">
                  <LinkVariantIcon size={16} />
                  <PropertyValue>
                    <Link
                      target="_blank"
                      onClick={onClick}
                      href={blog}
                    >
                      site
                    </Link>
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
