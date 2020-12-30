import { CANCEL } from 'redux-saga';
import { withCancellation } from './index';

const mock = (singal) => Promise.resolve(singal);

describe('Redux Utils', () => {
  describe('withCancellation', () => {
    it('should call a passed method', () => {
      const fn = jest.fn();
      withCancellation(fn);
      expect(fn).toBeCalled();
    });

    it('should return Promise', () => {
      const fn = jest.fn(mock);
      const result = withCancellation(fn);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should call a method with passed signal', async () => {
      const fn = jest.fn(mock);
      const result = await withCancellation(fn);
      expect(result).toBeInstanceOf(AbortSignal);
    });

    it('should add CANCEL props to returned object', async () => {
      const fn = jest.fn(mock);
      const result = withCancellation(fn);
      expect(result[CANCEL]).toBeDefined();
      expect(result[CANCEL]).toBeInstanceOf(Function);
      result[CANCEL]();
      const signal = await result;
      expect(signal).toHaveProperty('aborted', true);
    });
  });

  // TODO createSlice test
});
