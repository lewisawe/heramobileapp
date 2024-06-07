import {put, call} from 'redux-saga/effects';
import VerifyOtpActions from '@stores/verify-otp/actions';
import {userService} from '@services/user-service';
import {saveString, loadString} from '../../utils/storage';
import {t} from 'i18next';

export function* verifyOtp(params) {
  yield put(VerifyOtpActions.verifyOtpLoading());
  const fullPhoneNumber = params.countryCode + params.phoneNumber;

  try {
    const res = yield call(
      userService.verifyOtp,
      fullPhoneNumber,
      params.secretCode,
    );
    const userId = res.data.user_id.toString();
    yield call(saveString, 'userid', userId);
    yield call(saveString, 'fullphonenumber', fullPhoneNumber);
    yield call(saveString, 'countrycode', params.countryCode);
    yield call(saveString, 'phonenumber', params.phoneNumber);
    yield call(saveString, 'token', res.data.token);
    yield call(saveString, 'is_new_user', res.data.is_new_user + '');

    if (res.data.user_profile) {
      try {
        if (!res.data.is_new_user) {
          const lang = yield call(loadString, 'language');
          let language_key = '';
          switch (lang) {
            case 'English':
              language_key = 'en';
              break;
            case 'Arabic':
              language_key = 'ar';
              break;
            case 'Turkish':
              language_key = 'tr';
              break;
            case 'Dari':
              language_key = 'prs';
              break;
            case 'Pashto':
              language_key = 'pus';
              break;
            default:
              language_key = 'en';
              break;
          }
          yield call(userService.updateUserLanguage, userId, language_key);
        }
        const onboardingRes = yield call(
          userService.getOnboardingProgress,
          res.data.user_id.toString(),
        );

        if (onboardingRes.data.has_filled_children_info === true) {
          yield call(saveString, 'onboardingprogress', '3');
          yield put(
            VerifyOtpActions.verifyOtpSuccess({
              userId,
              onboardingProgress: 3,
              authToken: res.data.token,
            }),
          );
        } else if (onboardingRes.data.has_filled_pregnancy_status === true) {
          yield call(saveString, 'onboardingprogress', '2');
          yield put(
            VerifyOtpActions.verifyOtpSuccess({
              userId,
              onboardingProgress: 2,
              authToken: res.data.token,
            }),
          );
        } else if (onboardingRes.data.has_filled_profile === true) {
          yield call(saveString, 'onboardingprogress', '1');
          yield put(
            VerifyOtpActions.verifyOtpSuccess({
              userId,
              onboardingProgress: 1,
              authToken: res.data.token,
            }),
          );
        } else {
          yield put(
            VerifyOtpActions.verifyOtpSuccess({
              userId,
              onboardingProgress: 0,
              authToken: res.data.token,
            }),
          );
        }
      } catch (e) {
        console.log('error fetching onboarding progress');
        console.log(e);
        yield put(
          VerifyOtpActions.verifyOtpSuccess({
            userId,
            onboardingProgress: 0,
            authToken: res.data.token,
          }),
        );
      }
    } else {
      yield put(
        VerifyOtpActions.verifyOtpSuccess({
          userId,
          onboardingProgress: 0,
          authToken: res.data.token,
        }),
      );
    }
  } catch (e) {
    console.log(e);
    if (e.response) {
      if (e.response.status === 429) {
        yield put(VerifyOtpActions.verifyOtpFailure('Please try again later.'));
      } else {
        yield put(
          VerifyOtpActions.verifyOtpFailure(
            t('otp_screen_incorrect_code_text'),
          ),
        );
      }
    } else {
      yield put(
        VerifyOtpActions.verifyOtpFailure(t('otp_screen_incorrect_code_text')),
      );
    }
  }
}

export function* resendOtp(params) {
  yield put(VerifyOtpActions.verifyOtpLoading());
  try {
    const res = yield call(
      userService.getOtp,
      params.phoneNumber,
      params.acceptLanguage,
    );

    if (res.data.detail) {
      yield put(VerifyOtpActions.resendOtpFailure(res.data.detail));
    } else {
      yield put(VerifyOtpActions.resendOtpSuccess());
    }
  } catch (e) {
    console.log(e);
    yield put(VerifyOtpActions.resendOtpFailure(e.message));
  }
}
