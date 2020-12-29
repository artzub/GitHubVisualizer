import { createSlice as createToolkitSlice } from '@reduxjs/toolkit';
import { call, put, race, take, takeEvery } from 'redux-saga/effects';

const getCancelType = (type, token) => `${type}${token ? `_${token}` : ''}`;

const wrapWithNamespace = (cancelType, module) => {
  return {
    ...module,
    actions: Object.keys(module.actions)
      .reduce((acc, key) => {
        const { type } = module.actions[key];
        // if action is cancel action and cancel action has a payload then concat payload to type, otherwise just send the action type with optional namespace
        const wrapped = (payload, namespace) => ({
          type: type === cancelType && !!payload ? `${type}_${payload}` : type,
          payload,
          namespace,
        });
        wrapped.type = type;
        wrapped.toString = () => type;

        acc[key] = wrapped;

        return acc;
      }, {}),
  };
};

const clearState = (initialState) => () => {
  return initialState;
};

/**
  Function to create a redux "duck" module by reusing redux toolkit's
  createSlice. Motivation behind "duck" is to reduce unnecessary redux
  boilerplate as actions, types, reducers, and async actions are tightly coupled
  anyway. Adding helper functions also reduces repetitive information, "don't
  repeat yourself".

  Example:
```
  import { takeEvery, takeLatest, call, put } from 'redux-saga/effects'

  export default createSlice({
    name: 'todos',
    initialState: [],
    reducers: {
      addTodo(state, action) {
        state.push(action.payload);
      }
    },
    sagas: (actions, selectors) => ({
      // the computed object key is possible because redux toolkit adds
      // a .toString() for the action function
      [actions.addTodo]: {
        * saga(action) {
          // For the action addTodo, on every action make the API call.
          yield put(Api.postTodo, action.payload);
        },
        // takeLatest will cancel previous fetch if a new addTodo was received
        // by default if omitted, taker will be takeEvery
        taker: takeLatest
      },
    }),
    selectors: (getState) => ({
      getFirstTodo: createSelector(
        [getState],
        (state) => state[0],
      ),
    })
  })
```

  If you need fine grained control of the watcher saga, you can can use the
  'watcher' object key instead of 'saga'. This will ignore the taker and saga
  and insert your watcher directly in the module.sagas array. The name of the
  watcher saga need not be tied to any action.

```
  sagas: (actions, selectors) => ({
    watchLoginCycle: {
      * watcher() {
        while (true) {
          yield take('LOGIN_ACTION');
          // do login stuff...
          yield take('LOGOUT_ACTION');
          // do logout stuff...
        }
      }
    }
  })
```

  https://github.com/erikras/ducks-modular-redux

  https://redux.js.org/redux-toolkit/overview
*/
export const createSlice = ({ sagas, reducers, selectors, ...sliceOpts }) => {
  const hasCancel = !!reducers?.cancel;

  const stateIdentity = (s) => s;
  const sliceWithCancel = {
    ...sliceOpts,
    reducers: {
      ...(reducers || {}),
      cancel: reducers?.cancel || stateIdentity,
      clear: reducers?.clear || clearState(sliceOpts.initialState ?? {}),
    },
  };

  const toolkitSlice = createToolkitSlice(sliceWithCancel);
  const cancelType = toolkitSlice.actions.cancel.type;
  const wrappedSlice = wrapWithNamespace(cancelType, toolkitSlice);

  // Add default selector
  const getState = (state) => state[sliceOpts.name];
  const scopedSelectors = selectors?.(getState) || {};

  const newSlice = {
    ...wrappedSlice,
    selectors: {
      getState,
      ...scopedSelectors,
    },
  };

  // Handle Sagas option for slice
  if (sagas) {
    const sagasWithContext = sagas(newSlice.actions, newSlice.selectors);

    newSlice.sagas = Object.entries(sagasWithContext).map(([actionType, sagaObj]) => {
      let saga;
      let taker;

      // For some reason regenerator runtime wasn't generating Generators for all generating functions?
      // So require to check if typeof sagaObj is function instead
      if (typeof sagaObj === 'function') {
        saga = sagaObj;
        taker = takeEvery;
      } else if ('watcher' in sagaObj) {
        return sagaObj.watcher;
      } else {
        // eslint-disable-next-line prefer-destructuring
        saga = sagaObj.saga;
        taker = sagaObj.taker || takeEvery;
      }

      return function* () {
        yield taker(actionType, function* (action) {
          const { namespace: token = '' } = action;
          const cancelActionType = getCancelType(cancelType, token);

          yield race({
            task: call(saga, action),
            cancel: call(function* () {
              yield take(cancelActionType);

              if (hasCancel) {
                // FIXME if we have `cancel` reducer in a module it will be called in not correct workflow position.
                // It is true only for calling with namespace.
                yield put({
                  type: cancelType,
                  payload: token,
                });
              }

              return true;
            }),
          });
        });
      };
    });
  }

  return newSlice;
};

export default createSlice;
