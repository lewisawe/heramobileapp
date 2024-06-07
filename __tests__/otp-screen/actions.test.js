import VerifyOtpActions, {VerifyOtpTypes} from '@stores/verify-otp/actions';

describe('Otp Actions', () => {
  it('should test verifyOtp action', () => {
    const actionReturnValue = VerifyOtpActions.verifyOtp('phone', 'code');

    expect(actionReturnValue.type).toEqual(VerifyOtpTypes.VERIFY_OTP);
  });

  it('should test resendOtp action', () => {
    const actionReturnValue = VerifyOtpActions.resendOtp('phone', 'language');

    expect(actionReturnValue.type).toEqual(VerifyOtpTypes.RESEND_OTP);
  });

  it('should test resetState action', () => {
    const actionReturnValue = VerifyOtpActions.resetState();

    expect(actionReturnValue.type).toEqual('RESET_STATE');
  });
});
