import React, { forwardRef } from 'react';
import { Avatar } from '@material-ui/core';
import LinkOrigin from '@material-ui/core/Link';
import BookMultipleIcon from 'mdi-react/BookMultipleIcon';
import GithubIcon from 'mdi-react/GithubIcon';
import LinkVariantIcon from 'mdi-react/LinkVariantIcon';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import slice from '@/redux/modules/profiles';
import HeaderContainer from '../shared/HeaderContainer';
import InfoContainer from '../shared/InfoContainer';
import PropertiesOrigin from '../shared/Properties';
import Property from '../shared/Property';
import PropertyValue from '../shared/PropertyValue';
import Title from '../shared/Title';

const Container = styled(HeaderContainer)`
  min-width: 165px;
  max-width: 165px;
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
  margin-top: 0.5em;
  &:first-child {
    margin-top: 0;
  }
`;

const onClick = (event) => event.stopPropagation();

const Header = forwardRef((props, ref) => {
  const { selected } = useSelector(slice.selectors.getState);
  const {
    avatar, name, login,
    url, publicRepos, site,
  } = selected || {};

  return (
    <Container {...props} ref={ref}>
      <Avatar src={avatar} />
      <InfoContainer>
        {!selected && <div>Find a profile</div>}
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
                    href={url}
                  >
                    {login}
                  </Link>
                </PropertyValue>
              </Property>
            </Properties>
            <Properties>
              <Property title="Amount of repositories">
                <BookMultipleIcon size={16} />
                <PropertyValue>{publicRepos}</PropertyValue>
              </Property>
              {site && (
                <Property title="Web site">
                  <LinkVariantIcon size={16} />
                  <PropertyValue>
                    <Link
                      target="_blank"
                      onClick={onClick}
                      href={site}
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
});

Header.displayName = 'Header';

export default Header;
