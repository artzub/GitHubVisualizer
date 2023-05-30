import { call, put, cancelled } from 'redux-saga/effects';

import { getEmojis } from '@/redux/api/github/getEmojis';
import { createSlice, startFetching, stopFetching, fail } from '@/redux/utils';

import errorsSlice from './errors';

const { actions: { lastError } } = errorsSlice;

const initialState = {
  items: {},
};

export default createSlice({
  name: 'emojis',
  initialState,
  reducers: {
    fetch: startFetching,
    fetchSuccess: (state, { payload }) => {
      stopFetching(state);
      state.items = payload;
    },

    stopFetching,
    fail,
  },

  sagas: (actions) => ({
    [actions.fetch]: {
      * saga() {
        try {
          const { data } = yield call(getEmojis);
          yield put(actions.fetchSuccess(data));
        } catch (error) {
          yield put(lastError(actions.fail(error)));
        } finally {
          if (yield cancelled()) {
            yield put(actions.stopFetching());
          }
        }
      },
    },
  }),
});
