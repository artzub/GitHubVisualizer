import React, { useCallback, useState } from 'react';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import styled from 'styled-components';
import StepRepo from './StepRepo';
import StepShow from './StepShow';
import StepUser from './StepUser';

const steps = [{
  key: 'user',
  component: StepUser,
}, {
  key: 'repo',
  component: StepRepo,
}, {
  key: 'show',
  component: StepShow,
}];

const StepperStyled = styled(Stepper)`
    padding: 0;
`;

const Index = () => {
  const [opened, setOpened] = useState(-1);
  const [active, setActive] = useState(0);

  const onOpenBy = useCallback(
    (index) => () => {
      if (index === opened) {
        return;
      }

      const nextOpened = opened !== index ? index : -1;
      setOpened(nextOpened);
      setActive(nextOpened >= 0 ? nextOpened : active);
    },
    [opened, active],
  );

  const onCloseBy = useCallback(
    () => {
      setOpened(-1);
    },
    [],
  );

  return (
    <StepperStyled nonLinear activeStep={active}>
      {steps.map(({ key, component: Component }, index) => (
        <Step
          key={key}
          onMouseEnter={onOpenBy(index)}
          onMouseLeave={onCloseBy}
        >
          <StepLabel>
            <Component open={opened === index} onClickAway={onCloseBy} />
          </StepLabel>
        </Step>
      ))}
    </StepperStyled>
  );
};

export default Index;
