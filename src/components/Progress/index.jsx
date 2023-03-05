import { useSelector } from 'react-redux';

import styled from 'styled-components';

import LinearProgressOrigin from '@mui/material/LinearProgress';

import slice from '@/redux/modules/progress';

const Container = styled.div`
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  z-index: 100;
`;

const LinearProgress = styled(LinearProgressOrigin)`
  height: 2px;
`;

const normalize = ({ value, min, max }) => ((value - min) * 100) / (max - min);

const Progress = () => {
  const state = useSelector(slice.selectors.getState);

  const value = normalize(state);
  const valueBuffer = normalize({ ...state, value: state.valueBuffer });

  return !state.show ? null : (
    <Container>
      <LinearProgress
        variant="buffer"
        value={value}
        valueBuffer={valueBuffer}
      />
    </Container>
  );
};

export default Progress;
