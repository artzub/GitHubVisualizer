import { combineReducers } from 'redux';
import { reducers as sliceReducers } from './modules';

// WARNING: Put reducers for modules as modules in the index.js file.
const rootReducer = combineReducers({
  ...sliceReducers,
});

export {
  rootReducer,
};
