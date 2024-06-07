import {reducer} from '@stores/verify-otp/reducers';
import {INITIAL_STATE} from '@stores/verify-otp/initial-state';
import {VerifyOtpTypes} from '@stores/verify-otp/actions';

describe('Otp Reducers', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  it('should handle verifyOtp loading', () => {
    expect(
      reducer(undefined, {type: VerifyOtpTypes.VERIFY_OTP_LOADING}),
    ).toEqual({
      userId: null,
      authToken: null,
      onboardingProgress: 0,
      loading: true,
      resendOtpSuccess: false,
      errorMessage: '',
    });
  });

  it('should handle verifyOtp success', () => {
    expect(
      reducer(INITIAL_STATE, {
        type: VerifyOtpTypes.VERIFY_OTP_SUCCESS,
        data: {userId: '123', authToken: 'token', onboardingProgress: 2},
      }),
    ).toEqual({
      userId: '123',
      authToken: 'token',
      loading: false,
      errorMessage: '',
      onboardingProgress: 2,
      resendOtpSuccess: INITIAL_STATE.resendOtpSuccess,
    });
  });

  it('should handle verifyOtp failure', () => {
    const errorMessage = 'test';
    expect(
      reducer(INITIAL_STATE, {
        type: VerifyOtpTypes.VERIFY_OTP_FAILURE,
        errorMessage: errorMessage,
      }),
    ).toEqual({
      userId: null,
      authToken: null,
      loading: false,
      errorMessage,
      resendOtpSuccess: INITIAL_STATE.resendOtpSuccess,
      onboardingProgress: INITIAL_STATE.onboardingProgress,
    });
  });

  it('should handle resendOtp success', () => {
    expect(
      reducer(INITIAL_STATE, {type: VerifyOtpTypes.RESEND_OTP_SUCCESS}),
    ).toEqual({
      loading: false,
      errorMessage: '',
      resendOtpSuccess: true,
      onboardingProgress: INITIAL_STATE.onboardingProgress,
      userId: INITIAL_STATE.userId,
      authToken: INITIAL_STATE.authToken,
    });
  });

  it('should handle resendOtp failure', () => {
    const errorMessage = 'test';
    expect(
      reducer(INITIAL_STATE, {
        type: VerifyOtpTypes.RESEND_OTP_FAILURE,
        errorMessage: errorMessage,
      }),
    ).toEqual({
      resendOtpSuccess: false,
      loading: false,
      errorMessage,
      onboardingProgress: INITIAL_STATE.onboardingProgress,
      userId: INITIAL_STATE.userId,
      authToken: INITIAL_STATE.authToken,
    });
  });
});
