import {useState, useEffect} from 'react';
import {Text, View, Image, I18nManager, SafeAreaView} from 'react-native';
import {styles, color, icons, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {Input} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';
import OneSignal from 'react-native-onesignal';
import {useTranslation} from 'react-i18next';
import Modal from 'react-native-modal';
import {connect} from 'react-redux';
import {PropTypes} from 'prop-types';
import VerifyOtpActions from '@stores/verify-otp/actions';

const VerifyOtpScreen = props => {
  const textAlign = I18nManager.isRTL ? 'right' : 'left';
  const {t} = useTranslation();

  const [code, setCode] = useState('');
  const [timerCount, setTimer] = useState(60);
  const [reset, setReset] = useState(0);
  const {acceptLanguage, countryCode, phoneNumber} =
    props.navigation.state.params;

  const showError = () => {
    if (props.errorMessage.length > 0) {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={icons.error} style={{marginEnd: 8}} />
          <Text style={styles.ERROR_STYLE}>{props.errorMessage}</Text>
        </View>
      );
    }
  };

  useEffect(() => {
    if (props.userId) {
      OneSignal.setExternalUserId(props.userId, results => {
        // The results will contain push and email success statuses
        console.log('Results of setting external user id');
        console.log(results);

        // Push can be expected in almost every situation with a success status, but
        // as a pre-caution its good to verify it exists
        if (results.push && results.push.success) {
          console.log('Results of setting external user id push status:');
          console.log(results.push.success);
        }

        // Verify the email is set or check that the results have an email success status
        if (results.email && results.email.success) {
          console.log('Results of setting external user id email status:');
          console.log(results.email.success);
        }

        // Verify the number is set or check that the results have an sms success status
        if (results.sms && results.sms.success) {
          console.log('Results of setting external user id sms status:');
          console.log(results.sms.success);
        }

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

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer(lastTimerCount => {
        lastTimerCount <= 1 && clearInterval(interval);
        return lastTimerCount - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reset]);

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('otp_screen_toolbar_title')}
          navigation={props.navigation}
        />
      </SafeAreaView>
      <View style={styles.CONTAINER}>
        <Text style={styles.TEXT}>
          {t('otp_screen_enter_code_description')}
        </Text>
        <Input
          textAlign={textAlign}
          style={{marginTop: 20}}
          inputStyle={styles.NOPADMARGIN}
          containerStyle={styles.NOPADMARGIN}
          inputContainerStyle={{borderBottomColor: color.primary}}
          secureTextEntry={true}
          keyboardType="number-pad"
          returnKeyType="done"
          editable={true}
          onChangeText={setCode}
          placeholder={t('otp_screen_code_hint')}
          secureTextEntr
          value={code}
        />
        {showError()}
        <TouchableOpacity
          onPress={() => props.verifyOtp(countryCode, phoneNumber, code)}
          style={[styles.BUTTON, {marginTop: 20}]}>
          <Text style={styles.BUTTON_TEXT}>
            {t('otp_screen_continue_button')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={timerCount !== 0}
          onPress={() => {
            props.resendOtp(`${countryCode}${phoneNumber}`, acceptLanguage);
            setTimer(60);
            setReset(reset + 1);
            props.resetState();
          }}
          style={
            timerCount !== 0
              ? [styles.BUTTON_DISABLED, {marginTop: 20}]
              : [styles.BUTTON_ALT, {marginTop: 20}]
          }>
          {timerCount !== 0 ? (
            <Text style={styles.BUTTON_TEXT_DISABLED}>
              {t('otp_screen_resend_otp_button')} ({timerCount}s)
            </Text>
          ) : (
            <Text style={styles.BUTTON_TEXT_ALT}>
              {t('otp_screen_resend_otp_button')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {props.loading && (
        <Modal isVisible={true} animationIn="fadeIn" animationOut="fadeOut">
          <View style={{justifyContent: 'center', flex: 1}}>
            <View style={{alignSelf: 'center'}}>
              <Image
                source={gifLoading}
                style={{width: 100, height: 100, borderRadius: 20}}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

VerifyOtpScreen.propTypes = {
  userId: PropTypes.string,
  authToken: PropTypes.string,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onboardingProgress: PropTypes.number,
  resendOtpSuccess: PropTypes.bool,
  verifyOtp: PropTypes.func,
  resendOtp: PropTypes.func,
};

const mapStateToProps = state => ({
  userId: state.verifyOtp.userId,
  authToken: state.verifyOtp.authToken,
  onboardingProgress: state.verifyOtp.onboardingProgress,
  loading: state.verifyOtp.loading,
  errorMessage: state.verifyOtp.errorMessage,
  resendOtpSuccess: state.verifyOtp.resendOtpSuccess,
});

const mapDispatchToProps = dispatch => ({
  verifyOtp: (countryCode, phoneNumber, secretCode) => {
    return dispatch(
      VerifyOtpActions.verifyOtp(countryCode, phoneNumber, secretCode),
    );
  },
  resendOtp: (phoneNumber, acceptLanguage) => {
    return dispatch(VerifyOtpActions.resendOtp(phoneNumber, acceptLanguage));
  },
  resetState: () => {
    return dispatch(VerifyOtpActions.resetState('verifyOtp'));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(VerifyOtpScreen);
