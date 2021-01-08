import React, { useMemo, useRef } from 'react';
import { StageTypes } from '@/models/StageTypes';
import { useUIProperty } from '@/shared/hooks';
import UserVisualization from './Profile';
import Container from './shared/Container';

const Order = {
  [StageTypes.profile]: 0,
  [StageTypes.repository]: 1,
  [StageTypes.show]: 2,
};

const Visualization = () => {
  const [stage] = useUIProperty('view', StageTypes.profile);
  const prev = useRef(stage);

  const [dir, from] = useMemo(
    () => {
      const last = prev.current;
      const dir = Order[stage] - Order[prev.current];

      prev.current = stage;

      return [dir, last];
    },
    [stage],
  );

  return (
    <Container>
      <UserVisualization
        $active={stage === StageTypes.profile}
        $prev={from === StageTypes.profile}
        $dir={dir}
      />
      {/*<Tab
        $active={stage === StageTypes.repository}
        $prev={from === StageTypes.repository}
        $dir={dir}
      >
        {StageTypes.repository}
      </Tab>
      <Tab
        $active={stage === StageTypes.show}
        $prev={from === StageTypes.show}
        $dir={dir}
      >
        {StageTypes.show}
      </Tab>*/}
    </Container>
  );
};

export default Visualization;
