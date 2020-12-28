import React, { useCallback, useState } from 'react';
import FetchTopUser from "@/components/Header/FetchTopUser";
import User from "@/components/Header/User";
import UserSearch from "@/components/Header/UserSearch";
import { StageTypes } from "@/models/StageTypes";
import { useUIProperty } from "@/shared/hooks";
import Collapse from "@material-ui/core/Collapse";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

const PaperStyled = withStyles(() => ({
  root: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translate(-50%, 0)',
  },
}))(Paper);

const StepBodies = {
  [StageTypes.user]: UserSearch,
};

const Header = () => {
  const [step, setStep] = useUIProperty('step');
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const StepBody = StepBodies[step];

  const onClick = useCallback(
    (newStep) => () => {
      setStep(newStep);
      setBodyOpen((prev) => !prev);
    },
    [setBodyOpen, setStep],
  );

  return (
    <PaperStyled square>
      <FetchTopUser />
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        // variant="fullWidth"
        centered
        onChange={handleChange}
      >
        <Tab label="User" />
        <Tab label="Repository" />
        <Tab label="Show" />
      </Tabs>
      <Grid container>
        <User onClick={onClick(StageTypes.user)} />
        <div>
          Repository
        </div>
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
