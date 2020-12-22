import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Step, { propTypes } from './Step';
import Panel from './Panel';

const StepUser = (props) => {
  const { onClickAway, open } = props;

  const [repos, setRepos] = useState(true);
  const [histogram, setHistogram] = useState(true);

  const onReposChange = useCallback(
    ({ target }) => setRepos(target.checked),
    [],
  );

  const onHistogramChange = useCallback(
    ({ target }) => setHistogram(target.checked),
    [],
  );

  const title = useMemo(
    () => (
      <React.Fragment>
        <InputBase placeholder="GitHub username" />
        <IconButton component="span" aria-label="search">
          <SearchIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    ),
    [],
  );

  return (
    <Step open={open} onClickAway={onClickAway} title={title}>
      <Panel hint="Enter a GitHub username.">
        <FormControl component="fieldset">
          <FormLabel component="legend">
            Display:
          </FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={repos} onChange={onReposChange} />}
              label="Layer repos"
            />
            <FormControlLabel
              control={<Checkbox checked={histogram} onChange={onHistogramChange} />}
              label="Layer histogram languages"
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

StepUser.propTypes = {
  ...stepProps,
};

StepUser.defaultProps = {
  open: false,
};

export default StepUser;
