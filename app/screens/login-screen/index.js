import React, {useCallback, useEffect, useState} from 'react';
import {
  I18nManager,
  Image,
  Text,
  View,
  Pressable,
  Platform,
  SafeAreaView,
} from 'react-native';
import {ToolBar} from '../../components/toolbar';
import {
  imgFamily,
  imgLogoSmall,
  styles,
  gifLoading,
  appleLogo,
  googleLogo,
  color,
} from '../../theme';
import {SelectField, Picker} from '@components/select-field';
import {Input} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';

import CountryPicker from 'react-native-country-picker-modal';
import {useTranslation} from 'react-i18next';
import Modal from 'react-native-modal';
import {version} from '../../../package.json';
import {connect} from 'react-redux';
import {PropTypes} from 'prop-types';
import GetOtpActions from '@stores/login/actions';
import VerifyOtpActions from '@stores/verify-otp/actions';
import {style} from './style';
import ShowError from '@components/ShowError';
import useLanguage from '@hooks/useLanguage';
import {languageOptions} from '../../store/constants';
import CloudflareTurnstile from '../../components/CloudflareTurnstile/CloudflareTurnstile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CLOUDFLARE_BYPASS_TOKEN,
  GLOBAL_OTP_AUTH,
  GOOGLE_WEB_CLIENT_ID,
} from '@env';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import OneSignal from 'react-native-onesignal';
import SignInButton from '../../components/SignInButton/sign-in-button';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';

const LoginScreen = props => {
  const textAlign = I18nManager.isRTL ? 'right' : 'left';
  const [t] = useTranslation();
  const {language, acceptLanguage, setAppLanguage} = useLanguage();
  const [countryCode, setCountryCode] = useState('+90');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSecurityModalVisible, setIsSecurityModalVisible] = useState(false);
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [heraIconTapCounter, setHeraIconTapCounter] = useState(0);
  const [signInUpFailedModal, setSignInUpFailedModal] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');
  let languagePicker = React.createRef();

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  async function appleAuthOniOS() {
    try {
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
        // See: https://github.com/invertase/react-native-apple-authentication#faqs
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        console.log('Apple Sign-In failed - no identify token returned');
      }

      // Create a Firebase credential from the response
      const {identityToken, nonce} = appleAuthRequestResponse;

      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      // Sign the user in with the credential
      const userSignIn = auth().signInWithCredential(appleCredential);
      userSignIn
        .then(user => {
          props.verifyOtp(
            user.user.email + '|',
            user.user.uid,
            GLOBAL_OTP_AUTH,
          );
        })
        .catch(error => {
          console.log('userSignIn error', error);
        });
    } catch (error) {
      console.log('userSignIn error', error);
    }
  }

  async function appleAuthOnAndroid() {
    try {
      // Generate secure, random values for state and nonce
      const rawNonce = uuid();
      const state = uuid();

      // Configure the request
      appleAuthAndroid.configure({
        // The Service ID you registered with Apple
        clientId: 'org.heradigitalhealth.app',

        // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
        // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
        redirectUri:
          'https://hera-mobile-app-v2.firebaseapp.com/__/auth/handler',

        // The type of response requested - code, id_token, or both.
        responseType: appleAuthAndroid.ResponseType.ALL,

        // The amount of user information requested from Apple.
        scope: appleAuthAndroid.Scope.ALL,

        // Random nonce value that will be SHA256 hashed before sending to Apple.
        nonce: rawNonce,

        // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
        state,
      });

      // Open the browser window for user sign in
      const response = await appleAuthAndroid.signIn();

      // Create a Firebase credential from the response
      //identityToken
      const {id_token, nonce} = response;
      console.log(JSON.stringify(response));
      console.log(id_token);
      console.log(nonce);
      const appleCredential = auth.AppleAuthProvider.credential(
        id_token,
        nonce,
      );

      // Sign the user in with the credential
      const userSignIn = auth().signInWithCredential(appleCredential);
      userSignIn
        .then(user => {
          props.verifyOtp(
            user.user.email + '|',
            user.user.uid,
            GLOBAL_OTP_AUTH,
          );
        })
        .catch(error => {
          console.log('userSignIn error', error);
        });
    } catch (error) {
      console.log('userSignIn error', error);
    }
  }

  async function onAppleButtonPress() {
    if (Platform.OS === 'ios') {
      appleAuthOniOS();
    } else {
      appleAuthOnAndroid();
    }
  }

  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Sign-in the user with the credential
      const userSignIn = auth().signInWithCredential(googleCredential);

      userSignIn
        .then(user => {
          props.verifyOtp(
            user.user.email + '|',
            user.user.uid,
            GLOBAL_OTP_AUTH,
          );
        })
        .catch(error => {
          console.log('userSignIn error', error);
        });
    } catch (error) {
      console.log('userSignIn error', error);
    }
  }

  useEffect(() => {
    if (props.userId) {
      OneSignal.setExternalUserId(props.userId, results => {
        OneSignal.sendTag('first_time', 'no');
      });

      if (props.onboardingProgress === 3) {
        props.navigation.navigate('home', {token: props.authToken});
      } else if (props.onboardingProgress === 2) {
        props.navigation.navigate('childrenInfo', {token: props.authToken});
      } else if (props.onboardingProgress === 1) {
        props.navigation.navigate('yourPregnancy1', {token: props.authToken});
      } else {
        props.navigation.navigate('completeProfile', {token: props.authToken});
      }
    }
  }, [
    props.userId,
    props.authToken,
    props.onboardingProgress,
    props.navigation,
  ]);

  function openModal(modal) {
    modal.setModalVisible(true);
  }

  const checkIntroSeen = useCallback(async () => {
    const intro = await AsyncStorage.getItem('intro');
    if (!intro) {
      props.navigation.navigate('intro');
    }
  }, [props.navigation]);

  useEffect(() => {
    if (heraIconTapCounter >= 5 && isSecurityModalVisible) {
      setIsSecurityModalVisible(false);
      setHeraIconTapCounter(0);
      props.getOtp(
        countryCode + phoneNumber,
        acceptLanguage,
        CLOUDFLARE_BYPASS_TOKEN,
      );
    }
  }, [
    heraIconTapCounter,
    countryCode,
    phoneNumber,
    acceptLanguage,
    props,
    isSecurityModalVisible,
  ]);

  useEffect(() => {
    //AsyncStorage.removeItem('intro');
    checkIntroSeen();
  }, [checkIntroSeen]);

  useEffect(() => {
    if (props.getOtpSuccess) {
      props.resetState();
      props.navigation.navigate('otp', {
        acceptLanguage,
        countryCode,
        phoneNumber,
      });
      return;
    }
  }, [acceptLanguage, countryCode, phoneNumber, props]);

  const handleOpenPress = useCallback(() => {
    if (phoneNumber === '') {
      setValidationMsg(t('login_screen_phone_validation_msg'));
    } else {
      setIsSecurityModalVisible(true);
    }
  }, [setIsSecurityModalVisible, phoneNumber, t]);

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar title={''} navigation={props.navigation} />
      </SafeAreaView>
      <View style={styles.LOGIN_CONTAINER}>
        <Image source={imgFamily} style={style.imgFamily} />
        <Text style={style.screenTitle}>{t('login_screen_title')}</Text>
        <View style={style.languageDropdownContainer}>
          <SelectField
            placeholder={t('login_screen_select_language_dropdown_hint')}
            onChangeText={setAppLanguage}
            onSelect={() => openModal(languagePicker)}
            value={language}
            mandatory
          />
        </View>
        <View style={style.countryPickerContainer}>
          <View style={style.countryPickerSelectFieldContainer}>
            <SelectField
              onSelect={() => setCountryPickerVisible(true)}
              value={countryCode}
              mandatory
            />
          </View>
          <View style={style.countryPickerInputContainer}>
            <Input
              textAlign={textAlign}
              inputStyle={styles.NOPADMARGIN}
              containerStyle={styles.NOPADMARGIN}
              inputContainerStyle={style.countryPickerInput}
              editable={true}
              returnKeyType="done"
              keyboardType="number-pad"
              placeholder={t('login_screen_phone_number_hint')}
              onChangeText={setPhoneNumber}
              value={phoneNumber}
            />
          </View>
        </View>
        {props.errorMessage.length > 0 && (
          <ShowError errorMessage={props.errorMessage} />
        )}
        {validationMsg !== '' && (
          <Text
            style={{
              color: color.purple,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
            }}>
            {validationMsg}
          </Text>
        )}
        <View style={{marginTop: 20, flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <TouchableOpacity
              onPress={handleOpenPress}
              style={styles.BUTTON_ALT}>
              <Text style={styles.BUTTON_TEXT_ALT}>
                {t('login_screen_signup_button')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={style.fixedWidthView} />
          <View style={style.loginBtnContainer}>
            <TouchableOpacity onPress={handleOpenPress} style={styles.BUTTON}>
              <Text style={styles.BUTTON_TEXT}>
                {t('login_screen_login_button')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text style={{alignSelf: 'center'}}>
            -- {t('login_screen_or_word')} --
          </Text>
        </View>
        <View style={{height: 20}} />
        <View>
          <SignInButton
            title={t('login_screen_continue_with_google')}
            icon={googleLogo}
            textColor="#1F1F1F"
            fontSize={19}
            backgroundColor="#FFF"
            borderColor="#747775"
            borderWidth={1}
            borderRadius={20}
            width={312}
            height={40}
            onPress={() => onGoogleButtonPress()}
          />
        </View>
        <View style={{height: 10}} />
        <View>
          <SignInButton
            title={t('login_screen_continue_with_apple')}
            icon={appleLogo}
            textColor="#FFF"
            fontSize={19}
            backgroundColor="#000"
            borderWidth={0}
            borderRadius={20}
            width={312}
            height={40}
            onPress={() => onAppleButtonPress()}
          />
        </View>
        <TouchableOpacity
          onPress={() => setHeraIconTapCounter(heraIconTapCounter + 1)}>
          <Image source={imgLogoSmall} style={style.logoImage} />
        </TouchableOpacity>
        <Text style={style.versionNumber}>v {version}</Text>
        <Picker
          ref={instance => (languagePicker = instance)}
          data={languageOptions}
          label={t('login_screen_select_language_dropdown_hint')}
          value={language}
          onValueChange={setAppLanguage}
        />
        {isCountryPickerVisible && (
          <CountryPicker
            withCallingCode={true}
            preferredCountries={['TR', 'US']}
            onSelect={country => setCountryCode('+' + country.callingCode[0])}
            onClose={() => setCountryPickerVisible(false)}
            withFilter={true}
            visible
          />
        )}
      </View>
      {props.loading && (
        <Modal isVisible={true} animationIn="fadeIn" animationOut="fadeOut">
          <View style={{justifyContent: 'center', flex: 1}}>
            <View style={{alignSelf: 'center'}}>
              <Image source={gifLoading} style={style.loadingGif} />
            </View>
          </View>
        </Modal>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={signInUpFailedModal}>
        <View style={styles.CENTERED_VIEW}>
          <View style={styles.MODAL_VIEW}>
            <Text
              style={{
                fontWeight: '600',
                fontSize: 20,
                fontFamily: 'Roboto-Bold',
                textAlign: 'left',
              }}>
              {t('sign_in_up_error_message_text')}
            </Text>
            <Pressable
              style={[styles.BUTTON_ALT, {width: 100, marginTop: 20}]}
              onPress={() => setSignInUpFailedModal(!setSignInUpFailedModal)}>
              <Text style={styles.BUTTON_TEXT_ALT}>
                {t('close_button_text')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {heraIconTapCounter < 5 && (
        <CloudflareTurnstile
          successFn={token =>
            props.getOtp(countryCode + phoneNumber, acceptLanguage, token)
          }
          show={isSecurityModalVisible}
          setIsShow={setIsSecurityModalVisible}
        />
      )}
    </View>
  );
};

LoginScreen.propTypes = {
  getOtpSuccess: PropTypes.bool,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  getOtp: PropTypes.func,
  verifyOtp: PropTypes.func,
};

const mapStateToProps = state => ({
  userId: state.verifyOtp.userId,
  authToken: state.verifyOtp.authToken,
  onboardingProgress: state.verifyOtp.onboardingProgress,
  //taking from root store state and map it into props
  getOtpSuccess: state.getOtp.getOtpSuccess,
  loading: state.getOtp.loading,
  errorMessage: state.getOtp.errorMessage,
});

const mapDispatchToProps = dispatch => ({
  verifyOtp: (countryCode, phoneNumber, secretCode) => {
    return dispatch(
      VerifyOtpActions.verifyOtp(countryCode, phoneNumber, secretCode),
    );
  },
  getOtp: (phoneNumber, acceptLanguage, token) => {
    return dispatch(GetOtpActions.getOtp(phoneNumber, acceptLanguage, token));
  },
  resetState: () => {
    return dispatch(GetOtpActions.resetState('getOtp'));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
