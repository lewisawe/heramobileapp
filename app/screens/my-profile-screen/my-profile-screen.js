import {useCallback, useEffect, useState, createRef} from 'react';
import {
  Text,
  Switch,
  View,
  Image,
  Modal,
  StyleSheet,
  I18nManager,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import {styles, color, icons, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {Input} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {SelectField, Picker} from '../../components/select-field';
import {baseURL, genderOptions} from '../../store/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {dateToString} from '../../utils/helpers';
import {saveString, loadString, save, load} from '../../../utils/storage';
import CountryPicker from 'react-native-country-picker-modal';
import {useTranslation} from 'react-i18next';
import Modal2 from 'react-native-modal';
import useLanguage from '@hooks/useLanguage';
import {userService} from '../../services/user-service';

export const MyProfileScreen = ({navigation}) => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  const textAlign = I18nManager.isRTL ? 'right' : 'left';
  const {t} = useTranslation();

  let genderPicker = createRef();

  let translatedGenderOptions = genderOptions.map(function (value) {
    let key = '';
    switch (value) {
      case 'Male':
        key = 'gender_dropdown_male_text';
        break;
      case 'Female':
        key = 'gender_dropdown_female_text';
        break;
    }
    return t(key);
  });

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(maxDate);
  const [dobString, setDobString] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState('');
  const [userid, setUserid] = useState();
  const [latch, setLatch] = useState(2);
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isChangePhoneNumberModalVisible, setChangePhoneNumberModalVisible] =
    useState(false);
  const [code, setCode] = useState('');
  const [timerCount, setTimer] = useState(60);
  const [reset, setReset] = useState(0);
  const [changePhoneNumberErrorMessage, setChangePhoneNumberErrorMessage] =
    useState('');
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {acceptLanguage} = useLanguage();
  const [isWhatsappOptIn, setWhatsappOptIn] = useState(false);
  const [hideWhatsappOptIn, setHideWhatsappOptIn] = useState(true);

  useEffect(() => {
    loadString('token').then(authToken => {
      setToken(authToken);
    });
    loadString('userid').then(uid => {
      setUserid(uid);
    });
    loadString('fullphonenumber').then(fullphonenumber => {
      if (fullphonenumber !== '' && fullphonenumber[0] !== '+') {
        // this case will happen if the user choose to sign in using his
        // Google or Apple account, therefore, there is no phone number.
        setFullPhoneNumber('');
      } else {
        setFullPhoneNumber(fullphonenumber);
      }
    });
    loadString('opt_status').then(opt_status => {
      setWhatsappOptIn(opt_status === 'opt_in' ? true : false);
    });
  }, [userid]);

  useEffect(() => {
    setLatch(prev => prev - 1);
  }, [userid, token]);

  useEffect(() => {
    if (latch === 0) {
      load('my_profile_response').then(data => {
        if (data != null) {
          setName(data.name);
          if (data.gender === 'MALE') {
            setGender(t('gender_dropdown_male_text'));
          } else {
            setGender(t('gender_dropdown_female_text'));
          }
          setDobString(data.date_of_birth);
        } else {
          getProfile();
        }
      });

      load('my_phone_number_response').then(data => {
        if (data != null) {
          setCountryCode('+' + data.phone_country_code);
          setPhoneNumber(data.phone_national_number);
        } else {
          getPhoneNumber();
        }
      });
    }
  }, [getPhoneNumber, getProfile, latch, t]);

  useEffect(() => {
    let interval;
    if (reset) {
      interval = setInterval(() => {
        setTimer(lastTimerCount => {
          lastTimerCount <= 1 && clearInterval(interval);
          return lastTimerCount - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [reset]);

  useEffect(() => {
    if (fullPhoneNumber !== '') {
      getWhatsAppOptStatus();
    }
  }, [fullPhoneNumber, getWhatsAppOptStatus]);

  const getProfile = useCallback(
    refresh => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token ' + token,
        },
      };
      fetch(baseURL + '/user_profiles/' + userid + '/', requestOptions)
        .then(response => {
          if (refresh) {
            setRefreshing(false);
          } else {
            setLoading(false);
          }
          return response.json();
        })
        .then(data => {
          save('my_profile_response', data);
          setName(data.name);
          if (data.gender === 'MALE') {
            setGender(t('gender_dropdown_male_text'));
          } else {
            setGender(t('gender_dropdown_female_text'));
          }
          setDobString(data.date_of_birth);
        });
    },
    [t, token, userid],
  );

  const getPhoneNumber = useCallback(async () => {
    const data = await userService.getPhoneNumber();
    save('my_phone_number_response', data);
    if (
      data.phone_country_code === null ||
      data.phone_national_number === null
    ) {
      setCountryCode('');
      setPhoneNumber('');
      setFullPhoneNumber('');
    } else {
      setCountryCode('+' + data.phone_country_code);
      setPhoneNumber(data.phone_national_number);
    }
  }, []);

  const getWhatsAppOptStatus = useCallback(async () => {
    if (fullPhoneNumber === '') {
      // this means that the user is signed up using his/her Google or Apple account
      // so let consider that the WhatsApp opt_in is true, just to hide the request of
      // user's consent from upper area of the screen (the WhatsappOptIn component)
      setHideWhatsappOptIn(true);
    } else {
      const opt_status = await userService.getWhatsAppOptStatus(
        fullPhoneNumber,
      );
      saveString('opt_status', opt_status);
      setWhatsappOptIn(opt_status === 'opt_in' ? true : false);
      setHideWhatsappOptIn(false);
    }
  }, [fullPhoneNumber]);

  const updateWhatsAppOptStatus = async () => {
    const opt_status = await loadString('opt_status'); //.then(opt_status => {
    if (opt_status) {
      const opt_status_boolean = opt_status === 'opt_in' ? true : false;
      if (opt_status_boolean === isWhatsappOptIn) {
        //no need to update
        return;
      }

      setLoading(true);

      await userService.updateWhatsAppOptStatus(
        fullPhoneNumber,
        isWhatsappOptIn ? 'opt_in' : 'opt_out',
      );
    }
  };

  const updateData = () => {
    updateWhatsAppOptStatus();
    updateProfile();
  };

  const updateProfile = () => {
    const newFullPhoneNumber = countryCode + phoneNumber;
    if (newFullPhoneNumber !== fullPhoneNumber) {
      setChangePhoneNumberModalVisible(true);
      setTimer(60);
      setReset(reset + 1);
      getOTP();
      return;
    }

    setLoading(true);

    const genderRequest =
      gender === t('gender_dropdown_male_text') ? 'MALE' : 'FEMALE';

    const requestOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({
        name,
        gender: genderRequest,
        date_of_birth: dobString,
        language_code: acceptLanguage,
      }),
    };
    fetch(baseURL + '/user_profiles/' + userid + '/', requestOptions)
      .then(response => {
        setLoading(false);
        if (!response.ok) {
          throw new Error();
        }
        return response.json();
      })
      .then(data => {
        save('my_profile_response', data);
        navigation.goBack(null);
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
        setErrorMessage(e);
      });
  };

  const getOTP = () => {
    setLoading(true);
    const newFullPhoneNumber = countryCode + phoneNumber;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({new_phone_number: newFullPhoneNumber}),
    };
    fetch(baseURL + '/phone_number_change_requests/', requestOptions)
      .then(response => {
        setLoading(false);
        return response.json();
      })
      .then(data => {
        setId(data.id);
        if (data.detail) {
          setChangePhoneNumberErrorMessage(data.detail);
        } else {
          setChangePhoneNumberErrorMessage('');
        }
        setLoading(false);
      })
      .catch(e => {
        setLoading(false);
        throw new Error(e);
      });
  };

  const resendOTP = () => {
    setLoading(true);
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
    };
    fetch(
      baseURL + '/phone_number_change_requests/' + id + '/resend_otp/',
      requestOptions,
    )
      .then(response => {
        setLoading(false);
        if (!response.ok) {
          throw new Error();
        }
        return response.json();
      })
      .catch(e => {
        setLoading(false);
        throw new Error(e);
      });
  };

  const attemptChallenge = () => {
    setLoading(true);
    const newFullPhoneNumber = countryCode + phoneNumber;
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({guess_secret: code}),
    };
    fetch(
      baseURL + '/phone_number_change_requests/' + id + '/attempt_solve/',
      requestOptions,
    )
      .then(response => {
        setLoading(false);
        if (!response.ok) {
          if (response.status === 429) {
            setChangePhoneNumberErrorMessage(
              t('too_many_requests_error_message_text'),
            );
          } else {
            setChangePhoneNumberErrorMessage(
              t('otp_screen_incorrect_code_text'),
            );
          }
        } else {
          saveString('fullphonenumber', newFullPhoneNumber);
          saveString('countrycode', countryCode);
          saveString('phonenumber', phoneNumber);
          setFullPhoneNumber(newFullPhoneNumber);
          setChangePhoneNumberModalVisible(false);
        }
        return response.json();
      })
      .then(data => {
        save('my_phone_number_response', data);
        getPhoneNumber();
      })
      .catch(e => {
        throw new Error(e);
      });
    setLoading(false);
  };

  useEffect(() => {
    async function getToken() {
      await loadString('token').then(authToken => {
        setToken(authToken);
      });
    }
    getToken();
  }, []);

  function openModal(modal) {
    modal.setModalVisible(true);
  }

  const segmentDatePicker = () => {
    if (Platform.OS === 'android') {
      return (
        <DateTimePicker
          testID="dateTimePicker"
          value={dob}
          mode={'date'}
          is24Hour={true}
          display="default"
          maximumDate={maxDate}
          onChange={(event, date) => onChangeDob(date)}
        />
      );
    } else if (Platform.OS === 'ios') {
      return (
        <DateTimePickerModal
          isVisible={true}
          date={dob}
          value={dob}
          mode={'date'}
          maximumDate={maxDate}
          onConfirm={onChangeDob}
          onCancel={() => setDatePickerVisible(false)}
        />
      );
    }
  };

  const onChangeDob = date => {
    setDatePickerVisible(false);
    if (date) {
      setDob(date);
      setDobString(dateToString(date));
    }
  };

  const showError = () => {
    if (errorMessage.length > 0) {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={icons.error} style={{marginEnd: 8}} />
          <Text style={styles.ERROR_STYLE}>{errorMessage}</Text>
        </View>
      );
    }
  };

  const showChangePhoneNumberError = () => {
    if (changePhoneNumberErrorMessage.length > 0) {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={icons.error} style={{marginEnd: 8}} />
          <Text style={styles.ERROR_STYLE}>
            {changePhoneNumberErrorMessage}
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('my_profile_screen_toolbar_title')}
          navigation={navigation}
          hide={false}
        />
      </SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              getProfile(true);
              getPhoneNumber();
            }}
          />
        }>
        <View style={styles.CONTAINER}>
          <Input
            textAlign={textAlign}
            inputStyle={styles.NOPADMARGIN}
            containerStyle={styles.NOPADMARGIN}
            inputContainerStyle={{borderBottomColor: color.primary}}
            editable={true}
            returnKeyType="done"
            placeholder={t('my_profile_screen_name_hint')}
            onChangeText={setName}
            value={name}
          />
          <View style={{marginTop: 20}}>
            <SelectField
              onChangeText={setGender}
              value={gender}
              onSelect={() => openModal(genderPicker)}
              mandatory
            />
          </View>
          <View style={{marginTop: 20, flexDirection: 'row'}}>
            <View style={{width: 70}}>
              <SelectField
                onChangeText={this.onChangeCountryCode}
                onSelect={() => setCountryPickerVisible(true)}
                value={countryCode}
                mandatory
              />
            </View>
            <View style={{flex: 1, marginStart: 15}}>
              <Input
                textAlign={textAlign}
                inputStyle={styles.NOPADMARGIN}
                containerStyle={styles.NOPADMARGIN}
                inputContainerStyle={{borderBottomColor: color.primary}}
                editable={true}
                returnKeyType="done"
                keyboardType="number-pad"
                placeholder={t('my_profile_screen_phone_number_hint')}
                onChangeText={setPhoneNumber}
                value={phoneNumber}
              />
            </View>
          </View>
          <View style={{marginTop: 20}}>
            <SelectField
              onChangeText={setDob}
              placeholder={t('my_profile_screen_date_of_birth_hint')}
              value={dobString ? dobString.split('-').reverse().join('-') : ''}
              onSelect={() => setDatePickerVisible(true)}
              mandatory
            />
          </View>
          {hideWhatsappOptIn ? (
            <></>
          ) : (
            <View
              style={{
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text>{t('my_profile_screen_whatsapp_opt_in')}</Text>
              <View style={{flex: 1}} />
              <Switch
                trackColor={{false: '#767577', true: color.green}}
                //thumbColor={isWhatsappOptIn ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setWhatsappOptIn(!isWhatsappOptIn);
                }}
                value={isWhatsappOptIn}
              />
            </View>
          )}
          {showError()}
          <TouchableOpacity
            onPress={() => updateData()}
            style={[styles.BUTTON, {marginTop: 40}]}>
            <Text style={styles.BUTTON_TEXT}>
              {t('my_profile_screen_update_button')}
            </Text>
          </TouchableOpacity>
          <Picker
            ref={instance => (genderPicker = instance)}
            data={translatedGenderOptions}
            label={'Select Gender'}
            value={gender}
            onValueChange={setGender}
          />
          {isDatePickerVisible && segmentDatePicker()}
          {isCountryPickerVisible && (
            <CountryPicker
              withCallingCode={true}
              preferredCountries={['TR', 'US']}
              withFilter={true}
              onSelect={country => setCountryCode('+' + country.callingCode[0])}
              onClose={() => setCountryPickerVisible(false)}
              visible
            />
          )}
          {isChangePhoneNumberModalVisible && (
            <Modal
              animationType="fade"
              transparent={true}
              onRequestClose={() => {
                setChangePhoneNumberModalVisible(false);
              }}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPressOut={() => {
                    setChangePhoneNumberModalVisible(false);
                  }}>
                  <View style={modalStyles.modalView}>
                    <Text
                      style={[
                        styles.TEXT,
                        {
                          fontWeight: '700',
                          fontSize: 18,
                          color: color.primary,
                          alignSelf: 'flex-start',
                        },
                      ]}>
                      {t('phone_number_verification_title')}
                    </Text>
                    <Text style={[styles.TEXT, {fontSize: 16, marginTop: 16}]}>
                      {t('phone_number_verification_description')}
                    </Text>
                    <View>
                      <Input
                        textAlign={textAlign}
                        style={{marginTop: 20}}
                        inputStyle={styles.NOPADMARGIN}
                        containerStyle={styles.NOPADMARGIN}
                        inputContainerStyle={{borderBottomColor: color.primary}}
                        editable={true}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        secureTextEntry={true}
                        onChangeText={setCode}
                        placeholder={t(
                          'phone_number_verification_enter_otp_hint',
                        )}
                        secureTextEntr
                        value={code}
                      />
                    </View>
                    {showChangePhoneNumberError()}
                    <TouchableOpacity
                      onPress={() => attemptChallenge()}
                      style={[styles.BUTTON, {marginTop: 20}]}>
                      <Text style={styles.BUTTON_TEXT}>
                        {t('phone_number_verification_save_button')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={timerCount !== 0}
                      onPress={() => {
                        resendOTP();
                        setTimer(60);
                        setReset(reset + 1);
                        setChangePhoneNumberErrorMessage('');
                      }}
                      style={
                        timerCount !== 0
                          ? [styles.BUTTON_DISABLED, {marginTop: 20}]
                          : [styles.BUTTON_ALT, {marginTop: 20}]
                      }>
                      {timerCount !== 0 ? (
                        <Text style={styles.BUTTON_TEXT_DISABLED}>
                          {t('phone_number_verification_resend_otp_button')} (
                          {timerCount}s)
                        </Text>
                      ) : (
                        <Text style={styles.BUTTON_TEXT_ALT}>
                          {t('phone_number_verification_resend_otp_button')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            </Modal>
          )}
        </View>
      </ScrollView>
      {loading && (
        <Modal2 isVisible={true} animationIn="fadeIn" animationOut="fadeOut">
          <View style={{justifyContent: 'center', flex: 1}}>
            <View style={{alignSelf: 'center'}}>
              <Image
                source={gifLoading}
                style={{width: 100, height: 100, borderRadius: 20}}
              />
            </View>
          </View>
        </Modal2>
      )}
    </View>
  );
};

const modalStyles = StyleSheet.create({
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'stretch',
  },
});
