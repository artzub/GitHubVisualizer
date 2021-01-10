import React, { forwardRef } from 'react';
import slice from '@/redux/modules/repositories';
import Link from '@material-ui/core/Link';
import BookIcon from 'mdi-react/BookIcon';
import BookLockIcon from 'mdi-react/BookLockIcon';
import LinkIcon from 'mdi-react/LinkIcon';
import SourceRepositoryIcon from 'mdi-react/SourceRepositoryIcon';
import { useSelector } from 'react-redux';
import Container from '../shared/HeaderContainer';
import InfoContainer from '../shared/InfoContainer';
import Title from '../shared/Title';

const onClick = (event) => event.stopPropagation();

const Header = forwardRef((props, ref) => {
  const { selected } = useSelector(slice.selectors.getState);
  const { name, isPrivate, isFork, url } = selected || {};

  return (
    <Container {...props} ref={ref}>
      {isPrivate ? <BookLockIcon size={20} /> : (
        isFork
          ? <SourceRepositoryIcon size={20} />
          : <BookIcon size={20} />
      )}
      <InfoContainer>
        {!selected && <div>Choose a repository</div>}
        {selected && (
          <Title title={name}>
            <Link
              target="_blank"
              onClick={onClick}
              href={url}
              title="On github"
              style={{ verticalAlign: 'middle', marginRight: '3px' }}
            >
              <LinkIcon size={16} />
            </Link>
            {name}
          </Title>
        )}
      </InfoContainer>
    </Container>
  );
});

Header.displayName = 'Header';

export default Header;
