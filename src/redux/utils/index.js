export { default as createSlice } from './createSlice';
export { createSelector } from '@reduxjs/toolkit';
export * from './withCancellation';

/**
 * incs counter of request and set isFetching to true
 * @param state
 */
export const startFetching = (state) => {
  state.isFetching = true;
  state._requests = (state._requests ?? 0) + 1;
  state.error = '';
};

/**
 * decs counter of request and set isFetching to false if counter less than 1.
 * @param state
 */
export const stopFetching = (state) => {
  state._requests = Math.max(0, (state._requests ?? 1) - 1);
  state.isFetching = !!state._requests;
};

/**
 * Appends data into items if append is true, else override items by data
 * @param state
 * @param {Array} data
 * @param {boolean} append
 */
export const incrementFetching = (state, { payload: { data, append } }) => {
  const fixed = Array.isArray(data) ? data : [];
  state.items = append ? [
    ...state.items,
    ...fixed,
  ] : fixed;
};

/**
 * Stops fetching and set error message into state
 * @param {*} state
 * @param {Error} payload
 */
export const fail = (state, { payload: { message } }) => {
  stopFetching(state);
  state.error = message;
};
