import PropTypes from 'prop-types';

import styled from 'styled-components';

import { deepPurple } from '@mui/material/colors';
import MenuItemOrigin from '@mui/material/MenuItem';

const MenuItem = styled(MenuItemOrigin)`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MenuItemValue = styled(MenuItem)`
  font-size: 12px;
  padding: 0;
  pointer-events: none;

  color: ${deepPurple.A100};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Item = (props) => {
  const { value, icon, title, asValue, ...tail } = props;

  const Component = asValue ? MenuItemValue : MenuItem;

  return (
    <Component
      {...tail}
      key={value}
      value={value}
      title={value}
      tabIndex={asValue ? null : 0}
    >
      {icon}
      {title || value}
    </Component>
  );
};

Item.propTypes = {
  value: PropTypes.string.isRequired,
  icon: PropTypes.node,
  title: PropTypes.node,
  asValue: PropTypes.bool,
};

Item.defaultProps = {
  icon: null,
  title: null,
  asValue: false,
};

export default Item;
