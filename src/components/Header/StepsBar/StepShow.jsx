import React, { useCallback, useMemo, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PauseIcon from '@material-ui/icons/Pause';
import ReplayIcon from '@material-ui/icons/Replay';
import Step, { propTypes } from '@/components/Header/StepsBar/Step';
import Panel from '@/components/Header/StepsBar/Panel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';

const StepShow = props => {
  const { onClickAway, open } = props;

  const [statistic, setStatistic] = useState(true);
  const [contributors, setContributors] = useState(true);

  const onStatisticChange = useCallback(
    ({ target }) => setStatistic(target.checked),
    []
  );

  const onContributorsChange = useCallback(
    ({ target }) => setContributors(target.checked),
    []
  );

  const title = useMemo(
    () => (
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
    ),
    []
  );

  return (
    <Step open={open} onClickAway={onClickAway} title={title}>
      <Panel hint="Select visualization type, change settings and press the 'Run' button.">
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Display:
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={statistic} onChange={onStatisticChange} />}
              label="Layer canvas"
            />
          </FormGroup>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Setting:
          </FormLabel>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} >
              The number of cycles of life element
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={statistic} onChange={onStatisticChange} />}
                  label="Layer canvas"
                />
              </FormGroup>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} >
              Display
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={statistic} onChange={onStatisticChange} />}
                  label="Layer canvas"
                />
              </FormGroup>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} >
              Rate of decrease of
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={statistic} onChange={onStatisticChange} />}
                  label="Layer canvas"
                />
              </FormGroup>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} >
              Size of
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={statistic} onChange={onStatisticChange} />}
                  label="Layer canvas"
                />
              </FormGroup>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </FormControl>
      </Panel>
    </Step>
  );
};

const {
  title,
  children,
  ...stepProps
} = propTypes;

StepShow.propTypes = {
  ...stepProps
};

StepShow.defaultProps = {
  open: false
};

export default StepShow;
