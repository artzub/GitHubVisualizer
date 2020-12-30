import { getBranches } from '@/redux/api/github';
import slice from '@/redux/modules/progress';
import { createSlice, startFetching, stopFetching } from '@/redux/utils';
import { call, cancelled, delay, put } from 'redux-saga/effects';

const initialState = {
  selected: null,
  items: [],
  error: null,
};

export default createSlice({
  name: 'branches',
  initialState,
  reducers: {
    fetch: startFetching,
    fetchSuccess: (state, { payload: { data, append } }) => {
      const fixed = Array.isArray(data) ? data : [];
      state.items = append ? [
        ...state.items,
        ...fixed,
      ] : fixed;
    },

    setSelected: (state, { payload }) => {
      state.selected = payload;
    },

    stopFetching,

    fail: (state, { payload }) => {
      stopFetching(state);
      state.error = payload;
    },
  },

  sagas: (actions) => ({
    [actions.fetch]: {
      * saga({ payload: { owner, repo } }) {
        try {
          if (!owner || !repo) {
            yield put(actions.stopFetching());
            return;
          }

          yield put(slice.actions.change({
            max: 100,
            value: 0,
            valueBuffer: 0,
            show: true,
          }));

          let next = true;
          let page = 0;

          while (next) {
            const { data, pageInfo } = yield call(getBranches, {
              owner,
              repo,
              perPage: 100,
              page: page,
            });

            yield put(actions.fetchSuccess({ data, append: page > 0 }));

            page = pageInfo.nextPage;
            next = pageInfo.hasNextPage;

            yield put(slice.actions.change({ max: pageInfo.total || 100 }));
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
