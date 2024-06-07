import {runSaga} from 'redux-saga';
import MockAdapter from 'axios-mock-adapter';
import {heraClient} from '@services/user-service';
import {verifyOtp, resendOtp} from '@sagas/VerifyOtpSaga';
import {VerifyOtpTypes} from '@stores/verify-otp/actions';

const mock = new MockAdapter(heraClient);

describe('Otp Sagas', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should return resendOtp saga success', async () => {
    const dispatched = [];

    mock.onPost('/otp_auth/request_challenge/').reply(200, {});

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      resendOtp,
      {
        phoneNumber: '123',
        acceptLanguage: 'en',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(VerifyOtpTypes.VERIFY_OTP_LOADING);
    expect(dispatched[1].type).toEqual(VerifyOtpTypes.RESEND_OTP_SUCCESS);
  });

  it('should return getOtp saga failure', async () => {
    const dispatched = [];

    mock.onPost('/otp_auth/request_challenge/').reply(200, {
      detail: {
        errorMessage: 'test',
      },
    });

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      resendOtp,
      {
        phoneNumber: '123',
        acceptLanguage: 'en',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(VerifyOtpTypes.VERIFY_OTP_LOADING);
    expect(dispatched[1].type).toEqual(VerifyOtpTypes.RESEND_OTP_FAILURE);
    expect(dispatched[1].errorMessage).toEqual({
      errorMessage: 'test',
    });
  });

  it('should return onboarding 3 when has_filled_children_info is true', async () => {
    const dispatched = [];
    const userId = 123;

    mock.onPost('/otp_auth/attempt_challenge/').reply(200, {
      user_id: userId,
      token: 'token123',
      user_profile: {},
    });
    mock.onGet(`/onboarding_progresses/${userId}/`).reply(200, {
      has_filled_children_info: true,
      has_filled_pregnancy_status: true,
      has_filled_profile: true,
    });

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      verifyOtp,
      {
        phoneNumber: '123',
        code: 'abc1',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(VerifyOtpTypes.VERIFY_OTP_LOADING);
    expect(dispatched[1].type).toEqual(VerifyOtpTypes.VERIFY_OTP_SUCCESS);
    expect(dispatched[1].data.authToken).toEqual('token123');
    expect(dispatched[1].data.userId).toEqual('123');
    expect(dispatched[1].data.onboardingProgress).toEqual(3);
  });

  it('should return onboarding 2 when has_filled_pregnancy_status is true', async () => {
    const dispatched = [];
    const userId = 123;

    mock.onPost('/otp_auth/attempt_challenge/').reply(200, {
      user_id: userId,
      token: 'token123',
      user_profile: {},
    });
    mock.onGet(`/onboarding_progresses/${userId}/`).reply(200, {
      has_filled_children_info: false,
      has_filled_pregnancy_status: true,
      has_filled_profile: true,
    });

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      verifyOtp,
      {
        phoneNumber: '123',
        code: 'abc1',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(VerifyOtpTypes.VERIFY_OTP_LOADING);
    expect(dispatched[1].type).toEqual(VerifyOtpTypes.VERIFY_OTP_SUCCESS);
    expect(dispatched[1].data.onboardingProgress).toEqual(2);
  });

  it('should return onboarding 1 when has_filled_profile is true', async () => {
    const dispatched = [];
    const userId = 123;

    mock.onPost('/otp_auth/attempt_challenge/').reply(200, {
      user_id: userId,
      token: 'token123',
      user_profile: {},
    });
    mock.onGet(`/onboarding_progresses/${userId}/`).reply(200, {
      has_filled_children_info: false,
      has_filled_pregnancy_status: false,
      has_filled_profile: true,
    });

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      verifyOtp,
      {
        phoneNumber: '123',
        code: 'abc1',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(VerifyOtpTypes.VERIFY_OTP_LOADING);
    expect(dispatched[1].type).toEqual(VerifyOtpTypes.VERIFY_OTP_SUCCESS);
    expect(dispatched[1].data.onboardingProgress).toEqual(1);
  });

  it('should return onboarding 0 when profile is incomplete', async () => {
    const dispatched = [];
    const userId = 123;

    mock.onPost('/otp_auth/attempt_challenge/').reply(200, {
      user_id: userId,
      token: 'token123',
      user_profile: {},
    });
    mock.onGet(`/onboarding_progresses/${userId}/`).reply(200, {
      has_filled_children_info: false,
      has_filled_pregnancy_status: false,
      has_filled_profile: false,
    });

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      verifyOtp,
      {
        phoneNumber: '123',
        code: 'abc1',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(VerifyOtpTypes.VERIFY_OTP_LOADING);
    expect(dispatched[1].type).toEqual(VerifyOtpTypes.VERIFY_OTP_SUCCESS);
    expect(dispatched[1].data.onboardingProgress).toEqual(0);
  });

  it('should return onboarding 0 when get onboarding progress fail', async () => {
    const dispatched = [];
    const userId = 123;

    mock.onPost('/otp_auth/attempt_challenge/').reply(200, {
      user_id: userId,
      token: 'token123',
      user_profile: {},
    });
    mock.onGet(`/onboarding_progresses/${userId}/`).reply(500, {});

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      verifyOtp,
      {
        phoneNumber: '123',
        code: 'abc1',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(VerifyOtpTypes.VERIFY_OTP_LOADING);
    expect(dispatched[1].type).toEqual(VerifyOtpTypes.VERIFY_OTP_SUCCESS);
    expect(dispatched[1].data.onboardingProgress).toEqual(0);
  });
});
