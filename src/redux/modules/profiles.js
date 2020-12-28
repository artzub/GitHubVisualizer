import { getProfile, searchAccount } from '@/redux/api/github';
import { createSlice, startFetching, stopFetching } from "@/redux/utils";
import { call, put } from 'redux-saga/effects';

const initialState = {
  isFetching: false,
  profile: null,
  searched: [],
  top: [],
  error: null,
};

const setProfile = (state, profile) => {
  state.profile = profile;
};

export default createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    fetchProfile: startFetching,
    fetchProfileSuccess: (state, { payload }) => {
      stopFetching(state);
      setProfile(state, payload);
    },

    setProfile: (state, { payload }) => {
      setProfile(state, payload);
    },

    search: startFetching,
    searchSuccess: (state, { payload }) => {
      stopFetching(state);
      state.searched = Array.isArray(payload) ? payload : [];
    },
    fetchTop: startFetching,
    fetchTopSuccess: (state, { payload }) => {
      stopFetching(state);
      state.top = Array.isArray(payload) ? payload : [];
    },

    fail: (state, { payload: { message } }) => {
      stopFetching(state);
      state.error = message;
    },
  },

  sagas: (actions) => ({
    [actions.fetchProfile]: {
      * saga({ payload }) {
        try {
          const { data } = yield call(getProfile, payload);
          yield put(actions.fetchProfileSuccess(data));
        } catch (error) {
          yield put(actions.fail(error));
        }
      },
    },

    [actions.search]: {
      * saga({ payload }) {
        try {
          const { data } = yield call(searchAccount, payload);
          yield put(actions.searchSuccess(data));
        } catch (error) {
          yield put(actions.fail(error));
        }
      },
    },

    [actions.fetchTop]: {
      * saga() {
        try {
          const { data } = yield call(searchAccount, 'followers:>1000');
          yield put(actions.fetchTopSuccess(data));
        } catch (error) {
          yield put(actions.fail(error));
        }
      },
    },
  }),

  selectors: (selector) => ({

  }),
});
