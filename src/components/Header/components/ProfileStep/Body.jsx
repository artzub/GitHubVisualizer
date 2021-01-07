import React, { useCallback, useRef, useState } from 'react';
import { UrlPratTypes } from '@/models/UrlPartTypes';
import slice from '@/redux/modules/profiles';
import Highlight from '@/shared/components/Highlight';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import ScrollBar from '@/shared/components/ScrollBar';
import { useUIProperty } from '@/shared/hooks';
import { useRedirectTo } from '@/shared/hooks/useRedirectTo';
import {
  Avatar, ListItem as ListItemOrigin,
  ListItemAvatar, ListSubheader,
  TextField,
} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'react-use';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
`;

const ListContainer = styled(ScrollBar)`
  max-height: 300px;
  overflow: auto;
`;

const ListItem = styled(ListItemOrigin)`
  cursor: pointer;
  transition: background 0.3s;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const NotData = styled(({ className }) => (
  <div className={className}>
    <div>Profiles not found</div>
  </div>
))`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SearchHeader = (
  <ListSubheader component="li" disableSticky>
    Search results
  </ListSubheader>
);

const TopHeader = (
  <ListSubheader component="li" disableSticky>
    Top profiles
  </ListSubheader>
);

const Body = () => {
  const dispatch = useDispatch();
  const redirectTo = useRedirectTo(UrlPratTypes.profile);
  const inputRef = useRef();
  const listRef = useRef();
  const [search, setSearch] = useState('');
  const [neverChange, setNeverChange] = useState(true);
  const { isFetching, items, top } = useSelector(slice.selectors.getState);
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');

  const onChange = useCallback(
    (event) => {
      setNeverChange(false);
      setSearch(event.target.value);
      if (listRef.current) {
        listRef.current.scrollIntoViewIfNeeded();
      }
    },
    [],
  );

  const onClick = useCallback(
    (profile) => () => {
      setBodyOpen(false);
      redirectTo(profile.login);
    },
    [redirectTo, setBodyOpen],
  );

  useDebounce(
    () => {
      if (search) {
        dispatch(slice.actions.search(search));
      }

      return () => {
        dispatch(slice.actions.cancel());
      };
    },
    300,
    [search, dispatch],
  );

  useDebounce(
    () => {
      if (inputRef.current && bodyOpen) {
        inputRef.current.querySelector('input').focus();
      }
    },
    100,
    [bodyOpen],
  );

  return (
    <Container>
      <TextField
        label="Profile name"
        placeholder="Type profile name"
        onChange={onChange}
        ref={inputRef}
      />
      <LoadingOverlay loading={isFetching}>
        <ListContainer>
          {!neverChange && (
            <List
              ref={listRef}
              dense
              subheader={SearchHeader}
            >
              {!items.length && <NotData />}
              {(items || []).map((profile) => (
                <ListItem
                  alignItems="center"
                  key={profile.login}
                  onClick={onClick(profile)}
                >
                  <ListItemAvatar>
                    <Avatar src={profile.avatar_url} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Highlight search={search} text={profile.login} />}
                    secondary={profile.type}
                  />
                </ListItem>
              ))}
            </List>
          )}
          {!!top.length && (
            <List
              dense
              subheader={TopHeader}
            >
              {(top || []).map((profile) => (
                <ListItem
                  alignItems="center"
                  key={profile.login}
                  onClick={onClick(profile)}
                >
                  <ListItemAvatar>
                    <Avatar src={profile.avatar_url} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={profile.login}
                    secondary={profile.type}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </ListContainer>
      </LoadingOverlay>
    </Container>
  );
};

export default Body;
