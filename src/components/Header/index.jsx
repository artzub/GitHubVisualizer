import React, { useCallback, useState } from 'react';
import { StageTypes } from '@/models/StageTypes';
import branchesSlice from '@/redux/modules/branches';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';
import { useUIProperty } from '@/shared/hooks';
import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import BranchStepBody from './components/BranchStep/Body';
import BranchStepHeader from './components/BranchStep/Header';
import CommitsStepBody from './components/CommitsStep/Body';
import CommitsStepHeader from './components/CommitsStep/Header';
import RepoStepBody from './components/RepositoryStep/Body';
import RepoStepHeader from './components/RepositoryStep/Header';
import ShowStepHeader from './components/ShowStep/Header';
import UserStepBody from './components/UserStep/Body';
import UserStepHeader from './components/UserStep/Header';

const Container = styled.div`
  display: flex;
  position: relative;
  flex-wrap: nowrap;
  width: 100%;
`;

const Space = styled.div`
  flex: 1 1 0;
`;

const RepoBranchContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  & > * {
    width: 100%;
  }
`;

const PaperStyled = styled(Paper)`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, 0);
  max-width: 480px;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
`;

const StepBodies = {
  [StageTypes.user]: UserStepBody,
  [StageTypes.repository]: RepoStepBody,
  [StageTypes.branch]: BranchStepBody,
  [StageTypes.commits]: CommitsStepBody,
};

const Header = () => {
  const [step, setStep] = useUIProperty('step');
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');
  const [value, setValue] = useState(0);
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);
  const { selected: repository } = useSelector(repositoriesSlice.selectors.getState);
  const { selected: branch } = useSelector(branchesSlice.selectors.getState);

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
      <Container>
        <UserStepHeader
          onClick={onClick(StageTypes.user)}
          divider
        />
        <Space />
        <RepoBranchContainer>
          <RepoStepHeader
            onClick={onClick(StageTypes.repository)}
            disabled={!profile}
          />
          <BranchStepHeader
            onClick={onClick(StageTypes.branch)}
            disabled={!repository}
          />
        </RepoBranchContainer>
        <Space />
        <CommitsStepHeader
          onClick={onClick(StageTypes.commits)}
          disabled={!branch}
          divider
        />
        <ShowStepHeader disabled />
      </Container>
      {StepBody && (
        <Collapse in={bodyOpen}>
          <StepBody />
        </Collapse>
      )}
    </PaperStyled>
  );
};

export default Header;
