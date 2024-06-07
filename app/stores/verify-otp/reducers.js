/**
 * Reducers specify how the application's state changes in response to actions sent to the store.
 *
 * @see https://redux.js.org/basics/reducers
 */

import {INITIAL_STATE} from './initial-state';
import {createReducer} from 'reduxsauce';
import {VerifyOtpTypes} from './actions';

export const verifyOtpLoading = state => ({
  ...state,
  userId: null,
  authToken: null,
  onboardingProgress: 0,
  loading: true,
  resendOtpSuccess: false,
  errorMessage: '',
});

export const verifyOtpSuccess = (state, {data}) => ({
  ...state,
  userId: data.userId,
  authToken: data.authToken,
  loading: false,
  errorMessage: '',
  onboardingProgress: data.onboardingProgress,
});

export const verifyOtpFailure = (state, {errorMessage}) => ({
  ...state,
  userId: null,
  authToken: null,
  loading: false,
  errorMessage,
});

export const resendOtpSuccess = state => ({
  ...state,
  loading: false,
  errorMessage: '',
  resendOtpSuccess: true,
});

export const resendOtpFailure = (state, {errorMessage}) => ({
  ...state,
  loading: false,
  resendOtpSuccess: false,
  errorMessage,
});

/**
 * @see https://github.com/infinitered/reduxsauce#createreducer
 */
export const reducer = createReducer(INITIAL_STATE, {
  [VerifyOtpTypes.VERIFY_OTP_LOADING]: verifyOtpLoading,
  [VerifyOtpTypes.VERIFY_OTP_SUCCESS]: verifyOtpSuccess,
  [VerifyOtpTypes.VERIFY_OTP_FAILURE]: verifyOtpFailure,
  [VerifyOtpTypes.RESEND_OTP_SUCCESS]: resendOtpSuccess,
  [VerifyOtpTypes.RESEND_OTP_FAILURE]: resendOtpFailure,
});
