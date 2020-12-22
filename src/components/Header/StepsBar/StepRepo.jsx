import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Step, { propTypes } from './Step';
import Panel from './Panel';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import BarChartIcon from '@material-ui/icons/BarChart';

const StepRepo = (props) => {
  const { onClickAway, open } = props;

  const [statistic, setStatistic] = useState(true);
  const [contributors, setContributors] = useState(true);

  const onStatisticChange = useCallback(
    ({ target }) => setStatistic(target.checked),
    [],
  );

  const onContributorsChange = useCallback(
    ({ target }) => setContributors(target.checked),
    [],
  );

  const title = useMemo(
    () => (
      <React.Fragment>
        <Typography>
          Select Repository...
        </Typography>
        <Button component="span" startIcon={<BarChartIcon />}>
          Analyze
        </Button>
      </React.Fragment>
    ),
    [],
  );

  return (
    <Step open={open} onClickAway={onClickAway} title={title}>
      <Panel hint="Click by a repo in the graph or choose a repo in the below list.">
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Display:
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={statistic} onChange={onStatisticChange} />}
              label="Layer statistic of repo"
            />
            <FormControlLabel
              control={<Checkbox checked={contributors} onChange={onContributorsChange} />}
              label="Layer contributors diagram"
            />
          </FormGroup>
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

StepRepo.propTypes = {
  ...stepProps,
};

StepRepo.defaultProps = {
  open: false,
};

export default StepRepo;
