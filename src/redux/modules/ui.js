import { StageTypes } from '@/models/StageTypes';
import { createSlice } from '@/redux/utils';

const initialState = {
  step: StageTypes.user,
  view: StageTypes.repository,
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
