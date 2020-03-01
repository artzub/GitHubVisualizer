import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import PauseIcon from '@material-ui/icons/Pause';
import ReplayIcon from '@material-ui/icons/Replay';

const StepShow = props => {
  return (
    <Box display="flex" alignItems="center">
      <Button component="span" startIcon={<PlayIcon />}>
        Run
      </Button>
      <Button component="span" startIcon={<PauseIcon />}>
        Pause
      </Button>
      <Button component="span" startIcon={<StopIcon />}>
        Stop
      </Button>
      <Button component="span" startIcon={<ReplayIcon />}>
        Replay
      </Button>
    </Box>
  );
};

export default StepShow;
