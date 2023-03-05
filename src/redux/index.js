import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { rootSaga } from './modules';
import { rootReducer } from './reducers';

const isDevelopment = process.env.NODE_ENV === 'development';

const sagaMiddleware = createSagaMiddleware();

const middleware = [sagaMiddleware];

const configure = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware,
  });

  if (isDevelopment) {
    window.store = store;
  }

  sagaMiddleware.run(rootSaga);
  return store;
};

export const store = configure();
export default configure;
