import { call, cancelled, delay, put } from 'redux-saga/effects';
import { getBranches } from '@/redux/api/github';
import slice from '@/redux/modules/progress';
import {
  createSlice, incrementFetching,
  startFetching, stopFetching,
  fail,
} from '@/redux/utils';

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
    fetchSuccess: incrementFetching,

    setSelected: (state, { payload }) => {
      state.selected = payload;
    },

    stopFetching,
    fail,
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
          yield put(actions.fail(error));
        } finally {
          if (yield cancelled()) {
            yield put(actions.stopFetching());
          }

          yield delay(500);
          yield put(slice.actions.toggle(false));
        }
      },
    },
  }),
});
