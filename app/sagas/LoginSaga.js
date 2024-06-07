import {put, call} from 'redux-saga/effects';
import GetOtpActions from '@stores/login/actions';
import {userService} from '@services/user-service';

export function* login(params) {
  yield put(GetOtpActions.getOtpLoading());
  try {
    const res = yield call(
      userService.getOtp,
      params.phoneNumber,
      params.acceptLanguage,
      params.token,
    );

    if (res.data.detail) {
      yield put(GetOtpActions.getOtpFailure(res.data.detail));
    } else {
      yield put(GetOtpActions.getOtpSuccess());
    }
  } catch (e) {
    let msg = '';
    if (e.response.data.detail) {
      msg = e.response.data.detail;
    } else {
      msg = e.message;
    }
    yield put(GetOtpActions.getOtpFailure(msg));
  }
}
