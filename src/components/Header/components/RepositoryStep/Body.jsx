import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import slice from '@/redux/modules/repositories';
import Highlight from "@/shared/components/Highlight";
import LoadingOverlay from "@/shared/components/LoadingOverlay";
import { ScrollBarMixin } from "@/shared/components/ScrollBar";
import { useUIProperty } from "@/shared/hooks";
import {
  Avatar, ListItem as ListItemOrigin,
  ListItemAvatar, ListSubheader, TextField,
} from "@material-ui/core";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import debounce from 'lodash.debounce';
import SourceRepositoryIcon from "mdi-react/SourceRepositoryIcon";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "react-use";
import { FixedSizeList } from 'react-window';
import styled from "styled-components";
import Secondary from "./Secondary";

const Container = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
`;

const ListItems = styled(FixedSizeList)`
  height: 300px !important;

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

const bySearch = (search) => (item) => {
  return item?.name?.includes(search);
};

const Body = () => {
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
      dispatch(slice.actions.setRepository(item));
      setBodyOpen(false);
    },
    [setBodyOpen, dispatch],
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

      return (
        <ListItem
          alignItems="center"
          key={item.name}
          onClick={onClick(item)}
          style={style}
        >
          <ListItemAvatar>
            <Avatar>
              <SourceRepositoryIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Highlight search={search} text={item.name} />}
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
