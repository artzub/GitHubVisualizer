import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'react-use';
import { FixedSizeList } from 'react-window';

import debounce from 'lodash.debounce';
import styled from 'styled-components';

import {
  Avatar, ListItem as ListItemOrigin,
  ListItemAvatar, ListSubheader, TextField,
} from '@mui/material';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';

import BookIcon from 'mdi-react/BookIcon';
import BookLockIcon from 'mdi-react/BookLockIcon';
import SourceRepositoryIcon from 'mdi-react/SourceRepositoryIcon';

import { UrlPratTypes } from '@/models/UrlPartTypes';

import slice from '@/redux/modules/repositories';

import Highlight from '@/shared/components/Highlight';
import LoadingOverlay from '@/shared/components/LoadingOverlay';
import { ScrollBarMixin } from '@/shared/components/ScrollBar';
import { useUIProperty } from '@/shared/hooks';
import { useRedirectTo } from '@/shared/hooks/useRedirectTo';

import ListItemButton from '../shared/ListItemButton';
import Marker from '../shared/Marker';
import Secondary from './Secondary';

const Container = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  cursor: none;
`;

const ListItems = styled(FixedSizeList)`
  height: auto !important;
  max-height: 300px;

  ${ScrollBarMixin}
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
    <div>Repositories not found</div>
  </div>
))`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Primary = styled.span`
  display: flex;
  align-items: center;
`;

const bySearch = (search) => (item) => {
  return String(item?.name).toLowerCase().includes(search.toLowerCase());
};

const Body = () => {
  const redirectTo = useRedirectTo(UrlPratTypes.repository);
  const dispatch = useDispatch();
  const inputRef = useRef();
  const [search, setSearch] = useState('');
  const { isFetching, items } = useSelector(slice.selectors.getState);
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');
  const [filtered, setFiltered] = useState(items);

  const changeSearch = useMemo(
    () => debounce(
      (value) => setSearch(value),
      300,
    ),
    [],
  );

  const onChange = useCallback(
    (event) => {
      changeSearch(event.target.value);
    },
    [changeSearch],
  );

  const onClick = useCallback(
    (item) => () => {
      setBodyOpen(false);
      redirectTo(item.name);
    },
    [setBodyOpen, redirectTo],
  );

  const ListHeader = useMemo(
    () => (
      <ListSubheader component="div">
        Repositories: {filtered.length || 0} of {items.length || 0}
      </ListSubheader>
    ),
    [filtered.length, items.length],
  );

  const Item = useCallback(
    ({ index, style }) => {
      const item = filtered[index];
      const title = (item.private ? 'Private' : item.fork ? 'Fork' : 'Public');

      return (
        <ListItem
          component={ListItemButton}
          alignItems="center"
          key={item.name}
          onClick={onClick(item)}
          style={style}
          title={`${title} | ${item.name}`}
          tabIndex="0"
        >
          <ListItemAvatar>
            <Avatar>
              {item.isPrivate ? <BookLockIcon /> : (
                item.isFork ? <SourceRepositoryIcon /> : <BookIcon />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={(
              <Primary>
                {item.isPrivate && <Marker>private</Marker>}
                {item.isFork && <Marker>fork</Marker>}
                <Highlight search={search} text={item.name} />
              </Primary>
            )}
            secondary={<Secondary item={item} />}
          />
        </ListItem>
      );
    },
    [onClick, search, filtered],
  );

  useEffect(
    () => {
      setFiltered(search ? items.filter(bySearch(search)) : items);
    },
    [items, search, dispatch],
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
        label="Repository"
        placeholder="Type repository name"
        onChange={onChange}
        ref={inputRef}
      />
      <LoadingOverlay loading={isFetching}>
        {/*<ListContainer>*/}
        <List
          component="div"
          dense
          subheader={ListHeader}
        >
          {!filtered.length && <NotData />}
          <ListItems
            itemCount={filtered.length}
            itemSize={76}
            height={300}
          >
            {Item}
          </ListItems>
        </List>
        {/*</ListContainer>*/}
      </LoadingOverlay>
    </Container>
  );
};

export default Body;
