import { StageTypes } from '@/models/StageTypes';
import { createSlice } from '@/redux/utils';

const initialState = {
  step: StageTypes.profile,
  view: StageTypes.profile,
  bodyOpen: false,
};

export default createSlice({
  name: 'ui',
  initialState,
  reducers: {
    change: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    },
  },
});
