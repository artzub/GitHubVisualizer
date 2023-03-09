import PropTypes from 'prop-types';

import RouteModal from '@/shared/components/RouteModal';

import Group from './Group';

export const Collection = (props) => {
  const { items, ...tail } = props;

  return <RouteModal {...tail}>{items.map(Group)}</RouteModal>;
};

Collection.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};
