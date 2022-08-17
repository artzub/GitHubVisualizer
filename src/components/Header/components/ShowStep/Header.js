import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useEvent } from 'react-use';

import styled from 'styled-components';

import { IconButton } from '@material-ui/core';

import PauseIcon from 'mdi-react/PauseIcon';
import PlayArrowIcon from 'mdi-react/PlayArrowIcon';
import ReplayIcon from 'mdi-react/ReplayIcon';

import { useUIProperty } from '@/shared/hooks';

import HeaderContainer from '../shared/HeaderContainer';

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  min-width: 64px;
  max-width: 64px;
  overflow: hidden;
  
  & > * {
    transition: margin-left 0.3s, transform 0.3s;
    margin-left: 0;
    transform: translate(0, 0);
  }

  & > *:first-child:last-child {
    margin-left: 50%;
    transform: translate(-50%, 0);
  }
`;


const Header = (props) => {
  const { disabled, ...rest } = props;
  const [start, setStart] = useUIProperty('start');
  const [pause, setPause] = useUIProperty('pause');

  const onClick = useCallback(
    (type) => () => {
      switch (type) {
        case 'start':
          setStart(true);
          setPause(false);
          break;
        case 'pause':
          setPause(true);
          break;
        case 'replay':
          setPause(false);
          setStart(true);
          break;
        default:
          break;
      }
    },
    [setPause, setStart],
  );

  useEvent('blur', () => setPause(true), window);

  const isRun = start && !pause;

  return (
    <HeaderContainer
      {...rest}
      tabIndex="-1"
      button={false}
    >
      <ButtonContainer>
        <IconButton
          size="small"
          onClick={onClick(isRun ? 'pause' : 'start')}
          disabled={disabled}
        >
          {!!isRun && <PauseIcon size={24} />}
          {!isRun && <PlayArrowIcon size={24} />}
        </IconButton>
        {start && pause && (
          <IconButton
            size="small"
            onClick={onClick('replay')}
            disabled={disabled}
          >
            <ReplayIcon size={24} />
          </IconButton>
        )}
      </ButtonContainer>
    </HeaderContainer>
  );
};

Header.propTypes = {
  disabled: PropTypes.bool,
};

Header.defaultProps = {
  disabled: false,
};

export default Header;
