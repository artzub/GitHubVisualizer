import React, { useCallback, useState } from 'react';
import { StageTypes } from "@/models/StageTypes";
import profilesSlice from '@/redux/modules/profiles';
import { useUIProperty } from "@/shared/hooks";
import Collapse from "@material-ui/core/Collapse";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { useSelector } from "react-redux";
import RepoStepBody from "./components/RepositoryStep/Body";
import RepoStepHeader from "./components/RepositoryStep/Header";
import UserStepBody from "./components/UserStep/Body";
import UserStepHeader from "./components/UserStep/Header";

const PaperStyled = withStyles(() => ({
  root: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translate(-50%, 0)',
    maxWidth: '480px',
  },
}))(Paper);

const StepBodies = {
  [StageTypes.user]: UserStepBody,
  [StageTypes.repository]: RepoStepBody,
};

const Header = () => {
  const [step, setStep] = useUIProperty('step');
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');
  const [value, setValue] = useState(0);
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const StepBody = StepBodies[step];

  const onClick = useCallback(
    (newStep) => () => {
      setStep(newStep);
      setBodyOpen((prev) => (prev && step !== newStep ? prev : !prev));
    },
    [setBodyOpen, setStep, step],
  );

  return (
    <PaperStyled square>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        centered
        onChange={handleChange}
      >
        <Tab label="User" />
        <Tab label="Repository" />
        <Tab label="Show" />
      </Tabs>
      <Grid container>
        <UserStepHeader onClick={onClick(StageTypes.user)} />
        <RepoStepHeader onClick={onClick(StageTypes.repository)} disabled={!profile} />
        <div>
          Show
        </div>
      </Grid>
      {StepBody && (
        <Collapse in={bodyOpen}>
          <StepBody />
        </Collapse>
      )}
    </PaperStyled>
  );
};

export default Header;
