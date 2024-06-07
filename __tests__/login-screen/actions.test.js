import GetOtpActions, {GetOtpTypes} from '@stores/login/actions';

describe('Login Actions', () => {
  it('should test getOtp action', () => {
    const actionReturnValue = GetOtpActions.getOtp('phone', 'language');

    expect(actionReturnValue.type).toEqual(GetOtpTypes.GET_OTP);
  });

  it('should test resetState action', () => {
    const actionReturnValue = GetOtpActions.resetState();

    expect(actionReturnValue.type).toEqual('RESET_STATE');
  });
});
