import {combineReducers} from 'redux';
import configureStore from './create-store';
import rootSaga from '@sagas';
import {reducer as GetOtpReducer} from './login/reducers';
import {reducer as VerifyOtpReducer} from './verify-otp/reducers';

import modal from '../../store/reducers/modal';
import childs from '../../store/reducers/childs';

export default () => {
  const rootReducer = combineReducers({
    /**
     * Register your reducers here.
     * @see https://redux.js.org/api-reference/combinereducers
     */
    getOtp: GetOtpReducer,
    verifyOtp: VerifyOtpReducer,
    modal,
    childs,
  });

  return configureStore(rootReducer, rootSaga);
};
