/* eslint-disable no-console */
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

import { rootSaga } from './modules';
import { rootReducer } from './reducers';

const isDevelopment = process.env.NODE_ENV === 'development';

const sagaMiddleware = createSagaMiddleware();

const middleware = [
  sagaMiddleware,
];
const composeEnhancers = composeWithDevTools({
  // actionsBlacklist,
});

const configure = () => {
  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middleware)),
  );

  if (isDevelopment) {
    window.store = store;
  }

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      // eslint-disable-next-line global-require
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  sagaMiddleware.run(rootSaga);
  return store;
};

export const store = configure();
export default configure;
