import {reducer} from '@stores/login/reducers';
import {INITIAL_STATE} from '@stores/login/initial-state';
import {GetOtpTypes} from '@stores/login/actions';

describe('Login Reducers', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });

  it('should handle getOtp loading', () => {
    expect(reducer(undefined, {type: GetOtpTypes.GET_OTP_LOADING})).toEqual({
      getOtpSuccess: false,
      loading: true,
      errorMessage: '',
    });
  });

  it('should handle getOtp success', () => {
    expect(reducer(INITIAL_STATE, {type: GetOtpTypes.GET_OTP_SUCCESS})).toEqual(
      {
        getOtpSuccess: true,
        loading: false,
        errorMessage: '',
      },
    );
  });

  it('should handle getOtp failure', () => {
    const errorMessage = 'test';
    expect(
      reducer(INITIAL_STATE, {
        type: GetOtpTypes.GET_OTP_FAILURE,
        errorMessage: errorMessage,
      }),
    ).toEqual({
      getOtpSuccess: false,
      loading: false,
      errorMessage,
    });
  });
});
