import { put, takeLatest } from 'redux-saga/effects';

import { createSlice, fail } from '@/redux/utils';

const initialState = {
  error: null,
  errorStatus: null,
};

export default createSlice({
  name: 'errors',
  initialState,
  reducers: {
    lastError: () => {},

    fail,
  },

  sagas: (actions) => ({
    [actions.lastError]: {
      taker: takeLatest,
      * saga({ payload: effect }) {
        yield put(actions.clear());

        const { payload } = effect;

        yield put(effect);

        yield put(actions.fail(payload));
      },
    },
  }),
});
