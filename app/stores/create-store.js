import {applyMiddleware, compose, createStore} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {persistReducer, persistStore} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {apiMiddleware} from 'redux-api-middleware';
import thunk from 'redux-thunk';

/**
 * This import defaults to localStorage for web and AsyncStorage for react-native.
 *
 * Keep in mind this storage *is not secure*. Do not use it to store sensitive information
 * (like API tokens, private and sensitive data, etc.).
 *
 * If you need to store sensitive information, use redux-persist-sensitive-storage.
 * @see https://github.com/CodingZeal/redux-persist-sensitive-storage
 */

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  /**
   * Blacklist state that we do not need/want to persist
   */
  blacklist: ['getOtp', 'verifyOtp'],
};

export default (rootReducer, rootSaga) => {
  const middleware = [];
  const enhancers = [applyMiddleware(apiMiddleware, thunk)];

  // Connect the sagas to the redux store
  const sagaMiddleware = createSagaMiddleware();
  middleware.push(sagaMiddleware);

  enhancers.push(applyMiddleware(...middleware));

  const rootReducerHandler = (state, action) => {
    if (action.type === 'LOGOUT') {
      console.log('request logout');
      AsyncStorage.removeItem('persist:root');
      state = undefined;
    } else if (action.type === 'RESET_STATE') {
      if (action.reducerName) {
        state[action.reducerName] = undefined;
      }
    }
    return rootReducer(state, action);
  };
  // Redux persist
  const persistedReducer = persistReducer(persistConfig, rootReducerHandler);

  const store = createStore(persistedReducer, compose(...enhancers));
  const persistor = persistStore(store);

  // Kick off the root saga
  sagaMiddleware.run(rootSaga);

  return {store, persistor};
};
