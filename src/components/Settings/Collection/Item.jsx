import PropTypes from 'prop-types';

import styled, { css } from 'styled-components';

import ListItemOrigin from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const ListItem = styled(ListItemOrigin)`
  transition: background 0.3s;

  ${({ $isInteractive }) => ($isInteractive ?? true)
    && css`
      cursor: pointer;
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      &:active {
        background: rgba(255, 255, 255, 0.2);
      }
    `}
`;

const Item = (props) => {
  const { key, body, primary, secondary, ...tail } = props;

  return (
    <ListItem
      key={key}
      component="div"
      {...tail}
    >
      {body}
      {primary || secondary ? (
        <ListItemText
          primary={primary}
          secondary={secondary}
        />
      ) : null}
    </ListItem>
  );
};

Item.propTypes = {
  key: PropTypes.string.isRequired,
  body: PropTypes.node,
  primary: PropTypes.node,
  secondary: PropTypes.node,
  component: PropTypes.node,
};

Item.defaultProps = {
  body: null,
  primary: null,
  secondary: null,
  component: null,
};

export default Item;
