import PropTypes from 'prop-types';
import { useMemo } from 'react';

import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';

import Item from './Item';

const GroupHeader = (props) => (
  <ListSubheader
    component="div"
    disableSticky
    {...props}
  />
);

const Group = (props) => {
  const { items, title } = props;

  const header = useMemo(
    () => <GroupHeader>{title}</GroupHeader>,
    [title],
  );

  return (
    <List
      key={title}
      component="div"
      dense
      subheader={header}
    >
      {(items || []).map(Item)}
    </List>
  );
};

Group.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  title: PropTypes.node.isRequired,
};

export default Group;
