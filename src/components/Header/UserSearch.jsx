import React, { useCallback, useRef, useState } from 'react';
import slice from '@/redux/modules/profiles';
import Highlight from "@/shared/components/Highlight";
import LoadingOverlay from "@/shared/components/LoadingOverlay";
import ScrollBar from "@/shared/components/ScrollBar";
import { useUIProperty } from "@/shared/hooks";
import {
  Avatar, ListItem as ListItemOrigin,
  ListItemAvatar, ListSubheader,
  TextField,
} from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "react-use";
import styled from "styled-components";

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
  <ListSubheader component="div">
    Search results
  </ListSubheader>
);

const TopHeader = (
  <ListSubheader component="div">
    Top users
  </ListSubheader>
);

const UserSearch = () => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const [search, setSearch] = useState('');
  const [neverChange, setNeverChange] = useState(true);
  const { isFetching, searched, top } = useSelector(slice.selectors.getState);
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');

  const onChange = useCallback(
    (event) => {
      setNeverChange(false);
      setSearch(event.target.value);
    },
    [],
  );

  const onClick = useCallback(
    (user) => () => {
      dispatch(slice.actions.setProfile(user));
      setBodyOpen(false);
      dispatch(slice.actions.fetchProfile(user.login));
    },
    [setBodyOpen, dispatch],
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
        label="Username"
        placeholder="Type username"
        onChange={onChange}
        ref={inputRef}
      />
      <LoadingOverlay loading={isFetching}>
        <ListContainer>
          {!neverChange && (
            <List
              dense
              subheader={SearchHeader}
            >
              {!searched.length && <NotData />}
              {(searched || []).map((user) => (
                <ListItem
                  alignItems="center"
                  key={user.login}
                  onClick={onClick(user)}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar_url} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Highlight search={search} text={user.login} />}
                    secondary={user.type}
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
              {(top || []).map((user) => (
                <ListItem
                  alignItems="center"
                  key={user.login}
                  onClick={onClick(user)}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar_url} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.login}
                    secondary={user.type}
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

export default UserSearch;
