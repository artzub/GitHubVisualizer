import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UrlPratTypes } from '@/models/UrlPartTypes';
import branchesSlice from '@/redux/modules/branches';
import commitsSlice from '@/redux/modules/commits';
import { useUIProperty } from '@/shared/hooks';
import { useRedirectTo } from '@/shared/hooks/useRedirectTo';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import HistoryIcon from 'mdi-react/HistoryIcon';
import PlayArrowIcon from 'mdi-react/PlayArrowIcon';
import StopIcon from 'mdi-react/StopIcon';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 30px 20px 0px;
`;

const InputStyled = styled(Input)`
  width: 70px;
`;

const GridStyled = styled(Grid)`
  margin-top: 10px;
`;

const SliderContainer = styled(Grid)`
  &:not(#fake-id-for-hack) {
    padding-left: 22px;
    padding-top: 30px;
  }
`;

const valueLabelFormat = (value) => -value;

const Body = () => {
  const dispatch = useDispatch();
  const redirectTo = useRedirectTo(UrlPratTypes.commits);
  const [, setBodyOpen] = useUIProperty('bodyOpen');
  const [, setRefreshKey] = useUIProperty('refreshKey');
  const { isFetching } = useSelector(commitsSlice.selectors.getState);
  const { selected: branch } = useSelector(branchesSlice.selectors.getState);
  const { commits = 0 } = branch || {};
  const [storedValue, setStoredValue] = useUIProperty('commitsCount', Math.min(100, commits));
  const [value, setValue] = useState(-Math.min(commits, storedValue || 100));
  const min = -commits;
  const max = 0;

  const marks = useMemo(
    () => [{
      value: min,
      label: `${-min}`,
    }, min && {
      value: Math.floor(min * 0.5),
      label: `${Math.floor(-min * 0.5)}`,
    }].filter(Boolean),
    [min],
  );

  const onChange = useCallback(
    (_, newValue) => {
      setValue(newValue);
    },
    [],
  );

  const onChangeInput = useCallback(
    (event) => {
      const newValue = event.target.value;
      setValue((prev) => {
        if (!newValue && newValue !== 0) {
          return prev;
        }
        return Math.min(max, Math.max(min, -(+newValue)));
      });
    },
    [max, min],
  );

  const onClick = useCallback(
    () => {
      if (!value) {
        return;
      }

      setBodyOpen(false);
      setRefreshKey(Date.now());
      redirectTo(-value);
    },
    [redirectTo, setBodyOpen, setRefreshKey, value],
  );
  const onStop = useCallback(
    () => {
      dispatch(commitsSlice.actions.cancel());
    },
    [dispatch],
  );

  useEffect(
    () => {
      setStoredValue(-value);
    },
    [setStoredValue, value],
  );

  return (
    <Container>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <HistoryIcon size={26} />
        </Grid>
        <Grid item>
          <Typography gutterBottom>
            Analyze
          </Typography>
        </Grid>
        <Grid item>
          <InputStyled
            value={-value}
            margin="dense"
            onChange={onChangeInput}
            inputProps={{
              step: 1,
              type: 'number',
            }}
            disabled={isFetching}
          />
        </Grid>
        <Grid item>
          <Typography gutterBottom>
            last of commits:
          </Typography>
        </Grid>
      </Grid>
      <GridStyled container spacing={2} alignItems="center">
        <SliderContainer item xs>
          <Slider
            min={min}
            max={max}
            value={value}
            marks={marks}
            onChange={onChange}
            valueLabelFormat={valueLabelFormat}
            valueLabelDisplay="on"
            track="inverted"
            disabled={isFetching}
          />
        </SliderContainer>
        <Grid item>
          <Button
            variant="outlined"
            color={isFetching ? 'secondary' : 'default'}
            onClick={isFetching ? onStop : onClick}
          >
            {isFetching ? <StopIcon /> : <PlayArrowIcon />}
          </Button>
        </Grid>
      </GridStyled>
    </Container>
  );
};

export default Body;
