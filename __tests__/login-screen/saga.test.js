import {runSaga} from 'redux-saga';
import MockAdapter from 'axios-mock-adapter';
import {heraClient} from '@services/user-service';
import {login} from '@sagas/LoginSaga';
import {GetOtpTypes} from '@stores/login/actions';

const mock = new MockAdapter(heraClient);

describe('Login Sagas', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should return getOtp saga success', async () => {
    const dispatched = [];

    mock.onPost('/otp_auth/request_challenge/').reply(200, {});

    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      login,
      {
        phoneNumber: '123',
        acceptLanguage: 'en',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(GetOtpTypes.GET_OTP_LOADING);
    expect(dispatched[1].type).toEqual(GetOtpTypes.GET_OTP_SUCCESS);
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
      login,
      {
        phoneNumber: '123',
        acceptLanguage: 'en',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(GetOtpTypes.GET_OTP_LOADING);
    expect(dispatched[1].type).toEqual(GetOtpTypes.GET_OTP_FAILURE);
    expect(dispatched[1].errorMessage).toEqual({
      errorMessage: 'test',
    });
  });

  it('should return getOtp saga exception', async () => {
    const dispatched = [];
    mock.onPost('/otp_auth/request_challenge/').networkError();
    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      login,
      {
        phoneNumber: '123',
        acceptLanguage: 'en',
      },
    ).toPromise();

    expect(dispatched[0].type).toEqual(GetOtpTypes.GET_OTP_LOADING);
    expect(dispatched[1].type).toEqual(GetOtpTypes.GET_OTP_FAILURE);
  });
});
