import { getRepositories } from '@/redux/api/github';
import { createSlice, startFetching, stopFetching } from '@/redux/utils';
import { put, call, cancelled, delay } from 'redux-saga/effects';
import slice from './progress';

const initialState = {
  isFetching: false,
  selected: null,
  items: [],
  error: null,
};

export default createSlice({
  name: 'repositories',
  initialState,
  reducers: {
    setSelected: (state, { payload }) => {
      state.selected = payload;
    },

    fetchRepositories: startFetching,
    fetchRepositoriesSuccess: (state, { payload: { data, append } }) => {
      const fixed = Array.isArray(data) ? data : [];
      state.items = append ? [
        ...state.items,
        ...fixed,
      ] : fixed;
    },

    stopFetching,

    fail: (state, { payload: { message } }) => {
      stopFetching(state);
      state.error = message;
    },
  },

  sagas: (actions) => ({
    [actions.fetchRepositories]: {
      * saga({ payload: { owner, amount } }) {
        try {
          if (!amount || !owner) {
            yield put(actions.stopFetching());
            return;
          }

          yield put(slice.actions.change({
            max: amount,
            value: 0,
            valueBuffer: 0,
            show: true,
          }));

          let next = true;
          let page = 0;

          while (next) {
            const { data, pageInfo } = yield call(getRepositories, {
              owner,
              perPage: 100,
              page: page,
            });

            yield put(actions.fetchRepositoriesSuccess({ data, append: page > 0 }));

            page = pageInfo.nextPage;
            next = pageInfo.hasNextPage;

            yield put(slice.actions.change({ max: pageInfo.total || amount }));
            yield put(slice.actions.incValue(data.length));
            yield put(slice.actions.incValueBuffer(data.length + 100));
          }

          yield put(actions.stopFetching());
        } catch (error) {
          if (yield cancelled()) {
            yield put(actions.stopFetching);
            return;
          }
          yield put(actions.fail(error));
        } finally {
          yield delay(500);
          yield put(slice.actions.toggle(false));
        }
      },
    },
  }),
});
