import { getCommits } from '@/redux/api/github';
import slice from '@/redux/modules/progress';
import {
  createSlice, incrementFetching,
  startFetching, stopFetching,
  fail,
} from '@/redux/utils';
import { call, cancelled, delay, put } from 'redux-saga/effects';

const initialState = {
  items: [],
};

export default createSlice({
  name: 'commits',
  initialState,
  reducers: {
    fetch: startFetching,
    stopFetching,

    fetchSuccess: incrementFetching,

    fail,
  },

  sagas: (actions) => ({
    [actions.fetch]: {
      * saga({ payload: { owner, repo, branch, amount } }) {
        try {
          if (!owner || !repo || !branch || !amount) {
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
          let total = amount || 0;
          let nextPart = Math.min(amount, 100);

          while (next) {
            const { data, pageInfo } = yield call(getCommits, {
              owner,
              repo,
              perPage: nextPart,
              page: page,
            });

            yield put(actions.fetchSuccess({ data, append: page > 0 }));

            page = pageInfo.nextPage;
            total -= data.length;
            nextPart = Math.min(total, 100);

            next = pageInfo.hasNextPage && nextPart > 0;

            yield put(slice.actions.change({ max: Math.min(pageInfo.total || amount, amount) }));
            yield put(slice.actions.incValue(data.length));
            yield put(slice.actions.incValueBuffer(data.length + nextPart));
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
