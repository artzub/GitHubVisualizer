import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import PropTypes from 'prop-types';

const AlertStyled = withStyles(theme => ({
  root: {
    marginBottom: '8px'
  }
}))(Alert);
const Panel = props => {
  const { hint, children } = props;
  return (
    <React.Fragment>
      {hint && (
        <AlertStyled severity="info">
          {hint}
        </AlertStyled>
      )}
      {children}
    </React.Fragment>
  );
};

Panel.propTypes = {
  hint: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.element,
    PropTypes.func
  ]),
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.element,
    PropTypes.func
  ]).isRequired
};

Panel.defaultProps = {
  hint: null
};

export default Panel;
