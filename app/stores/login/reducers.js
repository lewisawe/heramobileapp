/**
 * Reducers specify how the application's state changes in response to actions sent to the store.
 *
 * @see https://redux.js.org/basics/reducers
 */

import {INITIAL_STATE} from './initial-state';
import {createReducer} from 'reduxsauce';
import {GetOtpTypes} from './actions';

export const getOtpLoading = state => ({
  ...state,
  getOtpSuccess: false,
  loading: true,
  errorMessage: '',
});

export const getOtpSuccess = state => ({
  ...state,
  getOtpSuccess: true,
  loading: false,
  errorMessage: '',
});

export const getOtpFailure = (state, {errorMessage}) => {
  return {
    ...state,
    getOtpSuccess: false,
    loading: false,
    errorMessage,
  };
};

/**
 * @see https://github.com/infinitered/reduxsauce#createreducer
 */
export const reducer = createReducer(INITIAL_STATE, {
  [GetOtpTypes.GET_OTP_LOADING]: getOtpLoading,
  [GetOtpTypes.GET_OTP_SUCCESS]: getOtpSuccess,
  [GetOtpTypes.GET_OTP_FAILURE]: getOtpFailure,
});
