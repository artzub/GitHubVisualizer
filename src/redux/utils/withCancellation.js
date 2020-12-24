import { CANCEL } from 'redux-saga';

/**
 * @param {function(signal: AbortSignal): Promise<*>} method
 * @return {Promise<*>}
 */
export const withCancellation = (method) => {
  const abortController = new AbortController();

  const result = method(abortController.signal);

  if (result) {
    result[CANCEL] = () => abortController.abort();
  }
  return result;
};
