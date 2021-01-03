import React, { useCallback, useRef } from 'react';
import { StageTypes } from '@/models/StageTypes';
import branchesSlice from '@/redux/modules/branches';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';
import { useUIProperty } from '@/shared/hooks';
import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { useSelector } from 'react-redux';
import { useClickAway } from 'react-use';
import styled from 'styled-components';
import BranchStepBody from './components/BranchStep/Body';
import BranchStepHeader from './components/BranchStep/Header';
import CommitsStepBody from './components/CommitsStep/Body';
import CommitsStepHeaderOrigin from './components/CommitsStep/Header';
import RepoStepBody from './components/RepositoryStep/Body';
import RepoStepHeader from './components/RepositoryStep/Header';
import ShowStepHeader from './components/ShowStep/Header';
import UserStepBody from './components/UserStep/Body';
import UserStepHeader from './components/UserStep/Header';

const PaperStyled = styled(Paper)`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, 0);
  max-width: 480px;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  z-index: 10;
`;

const Container = styled.div`
  display: flex;
  position: relative;
  flex-wrap: nowrap;
  width: 100%;
`;

const RepoBranchContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 2 1 auto;
  
  & > * {
    width: 100%;
  }
`;

const CommitsStepHeader = styled(CommitsStepHeaderOrigin)`
  flex: 1 1 auto;
`;

const StepBodies = {
  [StageTypes.profile]: UserStepBody,
  [StageTypes.repository]: RepoStepBody,
  [StageTypes.branch]: BranchStepBody,
  [StageTypes.commits]: CommitsStepBody,
};

const Header = () => {
  const [view, setView] = useUIProperty('view', StageTypes.profile);
  const [step, setStep] = useUIProperty('step');
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');
  const ref = useRef();
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);
  const { selected: repository } = useSelector(repositoriesSlice.selectors.getState);
  const { selected: branch } = useSelector(branchesSlice.selectors.getState);

  const handleChange = (event, newValue) => {
    setView(newValue);
  };

  const StepBody = StepBodies[step];

  const onClick = useCallback(
    (newStep) => () => {
      setStep(newStep);
      setBodyOpen((prev) => (prev && step !== newStep ? prev : !prev));
    },
    [setBodyOpen, setStep, step],
  );

  const onClickAway = useCallback(
    () => {
      setBodyOpen(false);
    },
    [setBodyOpen],
  );

  useClickAway(ref, onClickAway);

  return (
    <PaperStyled square ref={ref}>
      <Tabs
        value={view}
        indicatorColor="primary"
        textColor="primary"
        centered
        onChange={handleChange}
      >
        <Tab label="User" value={StageTypes.profile} />
        <Tab label="Repository" value={StageTypes.repository} />
        <Tab label="Show" value={StageTypes.show} />
      </Tabs>
      <Container>
        <UserStepHeader
          onClick={onClick(StageTypes.profile)}
          divider
        />
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
