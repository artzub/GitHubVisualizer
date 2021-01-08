import { createSlice, startFetching, stopFetching } from '@/redux/utils';

const initialState = {
  max: 100,
  min: 0,
  value: 0,
  valueBuffer: 0,
  show: false,
};

export default createSlice({
  name: 'progress',
  initialState,
  reducers: {
    change: (state, { payload }) => {
      const { show, ...rest } = payload;

      const newState = {
        ...state,
        ...rest,
      };

      if (show) {
        startFetching(newState);
      } else if (show === false) {
        stopFetching(newState);
      }
      newState.show = newState.isFetching;

      return newState;
    },

    incValue: (state, { payload }) => {
      state.value = Math.min(state.value + payload, state.max);
    },

    incValueBuffer: (state, { payload }) => {
      state.valueBuffer = Math.min(state.valueBuffer + payload, state.max);
    },

    toggle: (state, { payload }) => {
      const show = payload ?? !state.show;
      if (show) {
        startFetching(state);
      } else {
        stopFetching(state);
      }
      state.show = state.isFetching;
    },
  },
});
