import React, { useCallback, useState } from 'react';
import Stepper from '@material-ui/core/Stepper';
import StepUser from './StepUser';
import StepRepo from './StepRepo';
import StepShow from './StepShow';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import styled from 'styled-components';

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
    index => event => {
      if (index === opened) {
        return;
      }

      const nextOpened = opened !== index ? index : -1;
      setOpened(nextOpened);
      setActive(nextOpened >= 0 ? nextOpened : active);
    },
    [opened, active]
  );

  const onCloseBy = useCallback(
    event => {
      console.log(event);
      setOpened(-1);
    },
    []
  );

  return (
    <StepperStyled nonLinear activeStep={active}>
      {steps.map(({key, component: Component}, index) => (
        <Step key={key} onMouseEnter={onOpenBy(index)} onMouseLeave={onCloseBy}>
          <StepLabel>
            <Component open={opened === index} onClickAway={onCloseBy} />
          </StepLabel>
        </Step>
      ))}
    </StepperStyled>
  );
};

export default Index;
