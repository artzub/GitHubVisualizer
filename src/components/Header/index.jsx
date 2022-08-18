import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useClickAway } from 'react-use';

import styled from 'styled-components';

import Collapse from '@mui/material/Collapse';
import DividerOriginal from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

import { StageTypes } from '@/models/StageTypes';

import branchesSlice from '@/redux/modules/branches';
import profilesSlice from '@/redux/modules/profiles';
import repositoriesSlice from '@/redux/modules/repositories';

import { useUIProperty } from '@/shared/hooks';

import BranchStepBody from './components/BranchStep/Body';
import BranchStepHeader from './components/BranchStep/Header';
import CommitsStepBody from './components/CommitsStep/Body';
import CommitsStepHeaderOrigin from './components/CommitsStep/Header';
import ProfileStepBody from './components/ProfileStep/Body';
import ProfileStepHeader from './components/ProfileStep/Header';
import RepoStepBody from './components/RepositoryStep/Body';
import RepoStepHeader from './components/RepositoryStep/Header';
import ShowStepHeader from './components/ShowStep/Header';
import Tabs from './components/Tabs';

const PaperStyled = styled(Paper)`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, 0);
  max-width: 70vw;
  min-width: 375px;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
  z-index: 10;
  background-image: none;
`;

const Container = styled.div`
  display: flex;
  position: relative;
  flex-wrap: nowrap;
  width: 100%;
  cursor: none;
`;

const Divider = styled(DividerOriginal)`
  background: rgba(0, 0, 0, 0.2);
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
  min-width: 42px;
`;

const StepBodies = {
  [StageTypes.profile]: ProfileStepBody,
  [StageTypes.repository]: RepoStepBody,
  [StageTypes.branch]: BranchStepBody,
  [StageTypes.commits]: CommitsStepBody,
};

const Header = () => {
  const [step, setStep] = useUIProperty('step');
  const [bodyOpen, setBodyOpen] = useUIProperty('bodyOpen');
  const ref = useRef();
  const profileRef = useRef();
  const repositoryRef = useRef();
  const branchRef = useRef();
  const commitsRef = useRef();
  const { selected: profile } = useSelector(profilesSlice.selectors.getState);
  const { selected: repository } = useSelector(repositoriesSlice.selectors.getState);
  const { selected: branch } = useSelector(branchesSlice.selectors.getState);

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

  useEffect(
    () => {
      if (bodyOpen) {
        return;
      }

      let element;
      switch (step) {
        case StageTypes.profile:
          element = profileRef.current;
          break;
        case StageTypes.repository:
          element = repositoryRef.current;
          break;
        case StageTypes.branch:
          element = branchRef.current;
          break;
        case StageTypes.commits:
          element = commitsRef.current;
          break;
        default:
          break;
      }

      if (element) {
        element.focus();
      }
    },
    [bodyOpen, step],
  );

  return (
    <PaperStyled elevation={3} ref={ref}>
      <Container>
        <ProfileStepHeader
          onClick={onClick(StageTypes.profile)}
          divider
          ref={profileRef}
        />
        <RepoBranchContainer>
          <RepoStepHeader
            onClick={onClick(StageTypes.repository)}
            disabled={!profile}
            ref={repositoryRef}
          />
          <BranchStepHeader
            onClick={onClick(StageTypes.branch)}
            disabled={!repository}
            ref={branchRef}
          />
        </RepoBranchContainer>
        <CommitsStepHeader
          onClick={onClick(StageTypes.commits)}
          disabled={!branch}
          divider
          ref={commitsRef}
        />
        <ShowStepHeader disabled />
      </Container>
      {StepBody && (
        <Collapse in={bodyOpen}>
          <StepBody />
        </Collapse>
      )}
      {bodyOpen && StepBody && <Divider />}
      <Tabs />
    </PaperStyled>
  );
};

export default Header;
