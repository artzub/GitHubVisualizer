import { getEmojis } from '@/redux/api/github/getEmojis';
import { createSlice, startFetching, stopFetching } from '@/redux/utils';
import { call, put } from 'redux-saga/effects';

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

    fail: (state, { payload: { message } }) => {
      stopFetching(state);
      state.error = message;
    },
  },

  sagas: (actions) => ({
    [actions.fetch]: {
      * saga() {
        try {
          const { data } = yield call(getEmojis);
          yield put(actions.fetchSuccess(data));
        } catch (error) {
          yield put(actions.fail(error));
        }
      },
    },
  }),
});
