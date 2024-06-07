import {takeLatest, all} from 'redux-saga/effects';
import {GetOtpTypes} from '@stores/login/actions';
import {VerifyOtpTypes} from '@stores/verify-otp/actions';

import {login} from './LoginSaga';
import {verifyOtp, resendOtp} from './VerifyOtpSaga';

export default function* root() {
  yield all([
    /**
     * @see https://redux-saga.js.org/docs/basics/UsingSagaHelpers.html
     */
    // Call `login()` when a `getOtp` action is triggered
    takeLatest(GetOtpTypes.GET_OTP, login),
    takeLatest(VerifyOtpTypes.VERIFY_OTP, verifyOtp),
    takeLatest(VerifyOtpTypes.RESEND_OTP, resendOtp),
  ]);
}
