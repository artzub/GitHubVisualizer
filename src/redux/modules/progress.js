import { createSlice } from "@/redux/utils";

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
      return {
        ...state,
        ...payload,
      };
    },

    incValue: (state, { payload }) => {
      state.value = Math.min(state.value + payload, state.max);
    },

    incValueBuffer: (state, { payload }) => {
      state.valueBuffer = Math.min(state.valueBuffer + payload, state.max);
    },

    toggle: (state, { payload }) => {
      state.show = payload ?? !state.show;
    },

    clear() {
      return {
        ...initialState,
      };
    },
  },
});
