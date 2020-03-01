import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

const PaperStyled = withStyles(() => ({
  root: {
    padding: '0 16px',
    marginLeft: '-8px',
    boxShadow: `2px 3px 3px 0px rgba(0,0,0,0.12), -2px 3px 3px 0px rgba(0,0,0,0.12)`
  }
}))(Paper);

const BoxStyled = withStyles(() => ({
  root: {
    marginTop: '8px',
    marginBottom: '8px'
  }
}))(Box);

const Step = props => {
  const { open, onClickAway, title, children } = props;
  const boxRef = useRef(null);
  const [later, setLater] = useState(false);

  const onBoxRef = useCallback(
    node => {
      boxRef.current = node;
      if (node && node.parentNode) {
        boxRef.current = node.parentNode.parentNode.parentNode;
      }
    },
    []
  );

  const onHookClickAway = useCallback(
    event => {
      if (open && onClickAway) {
        onClickAway(event);
      }
    },
    [open, onClickAway]
  );

  useEffect(
    () => {
      const timer = setTimeout(() => {
        setLater(open);
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    },
    [open]
  );

  return (
    <ClickAwayListener onClickAway={onHookClickAway}>
      <Box display="flex" alignItems="center" ref={onBoxRef}>
        {title && title}

        <Popper
          disablePortal
          open={open}
          anchorEl={boxRef.current}
          placement="bottom-start"
          transition
        >
          {({ TransitionProps }) => (
            <PaperStyled
              square
              elevation={0}
            >
              <Collapse {...TransitionProps} in={later} timeout={350}>
                <BoxStyled display="flex" flexDirection="column">
                  {children}
                </BoxStyled>
              </Collapse>
            </PaperStyled>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.element,
    PropTypes.func
  ]).isRequired,
  title: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.element,
    PropTypes.func
  ]).isRequired,
  onClickAway: PropTypes.func.isRequired,

  open: PropTypes.bool
};

Step.propTypes = propTypes;

Step.defaultProps = {
  open: false
};

export default Step;