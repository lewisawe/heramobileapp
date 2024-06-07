import {createRef, useCallback, useEffect, useState} from 'react';
import {
  imgLogoSmall,
  color,
  styles,
  imgHomeAppointments,
  imgHomePregnancy,
  imgHomeHealthRecords,
  imgHomeChildren,
  imgHomeNearbyHealthCenters,
  imgHomeEmergencyCall,
  imgHomeHealthTipsNews,
  imgHomeSettings,
  imgFacebook,
  imgFacebookFlipped,
  icons,
  imgHomeTranslator,
  imgHomeShrh,
  imgHomeWhatsappHotline,
  imgHomeFeedback,
  imgHomeSOS,
} from '../../theme';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
  I18nManager,
  SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  keyAppointments,
  keyChildren,
  keyEmergencyCall,
  keyHealthCenters,
  keyHealthRecords,
  keyHealthTipsNews,
  keyPregnancy,
  keySettings,
  keyFacebook,
  baseURL,
  keyTranslator,
  keyShrh,
  keyWhatsappHotline,
  keyFeedback,
  keySOS,
} from '../../store/constants';
import {Picker} from '../../components/select-field';
import {languageOptions} from '../../store/constants';
import {saveString, loadString, save} from '../../../utils/storage';
import {useTranslation} from 'react-i18next';
import RNRestart from 'react-native-restart';
import * as RNLocalize from 'react-native-localize';
import DeviceCountry, {TYPE_TELEPHONY} from 'react-native-device-country';
import {getChildInfo} from '../../api/childs';
import numbers from '../../../utils/phonenumbers.json';
import WhatsappOptIn from '../../components/whatsapp-opt-in/WhatsappOptIn';
import {useDispatch} from 'react-redux';
import {updateChilds} from '../../../store/actions/childs';
import {userService} from '@services/user-service';
import {NavigationEvents} from 'react-navigation';
import {enableModal} from '../../../store/actions/modal';
import {t} from 'i18next';
import {YesNoModal} from '../../components/YesNoModal';

export const HomeScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [language, setLanguage] = useState('');
  const [dataSource, setDataSource] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [token, setToken] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const {i18n} = useTranslation();
  const [userid, setUserid] = useState();
  const [timezone, setTimezone] = useState('');
  const [latch, setLatch] = useState(4);
  const [notifications, setNotifications] = useState([]);
  const [languagelatch, setLanguageLatch] = useState(3);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const languagePicker = createRef();
  const [isWhatsappOptIn, setWhatsappOptIn] = useState(false);
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');

  let translatedLanguageOptions = languageOptions.map(function (value) {
    let key = '';
    switch (value) {
      case 'English':
        key = 'language_dropdown_english_text';
        break;
      case 'Arabic':
        key = 'language_dropdown_arabic_text';
        break;
      case 'Turkish':
        key = 'language_dropdown_turkish_text';
        break;
      case 'Dari':
        key = 'language_dropdown_dari_text';
        break;
      case 'Pashto':
        key = 'language_dropdown_pashto_text';
        break;
    }
    return i18n.t(key);
  });

  const getSurvey = authToken => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + authToken,
      },
    };
    fetch(baseURL + '/surveys/pending/', requestOptions)
      .then(response => {
        return response.json();
      })
      .then(data => {
        setSurveys(data);
      });
  };

  const getNotifications = authToken => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + authToken,
      },
    };
    fetch(baseURL + '/notification_events/', requestOptions)
      .then(response => {
        return response.json();
      })
      .then(data => {
        save('notifications_response', data);
        setNotifications(data);
      });
  };

  useEffect(() => {
    if (notifications !== null && notifications.length > 0) {
      notifications.forEach(element => {
        if (element.read_at === null) {
          setHasUnreadNotifications(true);
        }
      });
    }
  }, [notifications]);

  useEffect(() => {
    setLatch(prev => prev - 1);
    setLanguageLatch(prev => prev - 1);
  }, [userid, token, language, timezone]);

  useEffect(() => {
    if (latch === 0 && timezone !== RNLocalize.getTimeZone()) {
      updateTimezone();
    }
  }, [latch, timezone, updateTimezone]);

  useEffect(() => {
    setupTiles();

    loadData();
  }, [setupTiles, loadData]);

  useEffect(() => {
    if (languagelatch === 0) {
      loadString('updatelanguage').then(updatelanguage => {
        if (updatelanguage === 'true') {
          switch (i18n.language) {
            case 'en':
              userService.updateUserLanguage(userid, 'en');
              break;
            case 'ar':
              userService.updateUserLanguage(userid, 'ar');
              break;
            case 'tr':
              userService.updateUserLanguage(userid, 'tr');
              break;
            case 'prs':
              userService.updateUserLanguage(userid, 'prs');
              break;
            case 'pus':
              userService.updateUserLanguage(userid, 'pus');
              break;
          }
        }
      });
    }
  }, [i18n.language, languagelatch, userid]);

  useEffect(() => {
    if (token) {
      async function updateChildInfo() {
        const childInfo = await getChildInfo(token);
        dispatch(updateChilds(childInfo));
      }
      updateChildInfo();
    }
  }, [dispatch, token]);

  const updateTimezone = useCallback(() => {
    const requestOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({timezone: RNLocalize.getTimeZone()}),
    };
    fetch(baseURL + '/user_profiles/' + userid + '/', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error();
        }
        return response.json();
      })
      .then(data => {
        saveString('timezone', RNLocalize.getTimeZone());
      })
      .catch(e => {});
  }, [token, userid]);

  const askForSignInApproval = msg => {
    dispatch(
      enableModal(true, () => (
        <YesNoModal
          message={msg}
          yesTitle={t('your_pregnancy_screen_answer_yes_button')}
          noTitle={t('your_pregnancy_screen_answer_no_button')}
          onOKClicked={async () => {
            // I save the key 'intro' with an arbitrary value: 'no'
            // to bypass the intro screen. Because the current logic that
            // is existing in the login screen, is to display the intro screen
            // if the 'intro' key has a null value.
            save('intro', 'no').then(d => navigation.navigate('login'));
          }}
        />
      )),
    );
  };

  const postSurvey = (id, answer) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({response: answer}),
    };
    fetch(baseURL + '/surveys/' + id + '/response/', requestOptions)
      .then(response => {
        save('my_children_need_refetch', true);
        if (!response.ok) {
          throw new Error();
        } else {
          return response.json();
        }
      })
      .then(data => {})
      .catch(e => {});
  };

  const loadData = useCallback(async () => {
    const [authToken, userId, timeZone, loadLanguage, is_new_user] =
      await Promise.all([
        loadString('token'),
        loadString('userid'),
        loadString('timezone'),
        loadString('language'),
        loadString('is_new_user'),
      ]);

    if (authToken) {
      setIsSignedIn(true);
    } else {
      setIsSignedIn(false);
      return;
    }

    getSurvey(authToken);
    getNotifications(authToken);
    setToken(authToken);
    setUserid(userId);
    setTimezone(timeZone);
    setLanguage(loadLanguage);
    setLanguageLatch(prev => prev - 1);

    const result = await userService.getFullPhoneNumber();
    if (result === '') {
      // this means that the user is signed up using his/her Google or Apple account
      // so let consider that the WhatsApp opt_in is true, just to hide the request of
      // user's consent from upper area of the screen (the WhatsappOptIn component)
      setWhatsappOptIn(true);
    } else {
      const optStatus = await userService.getWhatsAppOptStatus(result);
      setWhatsappOptIn(optStatus === 'opt_in' ? true : false);
    }
    setFullPhoneNumber(result);

    if (is_new_user === 'true') {
      askForWhatsAppNotificationsConsent(result);
      saveString('is_new_user', 'false');
    }
  }, [askForWhatsAppNotificationsConsent]);

  const askForWhatsAppNotificationsConsent = useCallback(
    phonenumber => {
      dispatch(
        enableModal(true, () => (
          <YesNoModal
            message={t('question_make_sure_whatsapp_modal')}
            yesTitle={t('your_pregnancy_screen_answer_yes_button')}
            noTitle={t('your_pregnancy_screen_answer_no_button')}
            onOKClicked={async () => {
              await userService.updateWhatsAppOptStatus(phonenumber, 'opt_in');
              setWhatsappOptIn(true);
            }}
          />
        )),
      );
    },
    [dispatch],
  );

  const setupTiles = useCallback(() => {
    setDataSource([
      {
        title: `${i18n.t('home_screen_whatsapp_hotline_title')}`,
        key: keyWhatsappHotline,
        image: imgHomeWhatsappHotline,
        textColor: color.green,
        backgroundColor: color.whatsappgreen,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_sos_title')}`,
        key: keySOS,
        image: imgHomeSOS,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_my_appointments_title')}`,
        key: keyAppointments,
        image: imgHomeAppointments,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: true,
      },
      {
        title: `${i18n.t('home_screen_translator_title')}`,
        key: keyTranslator,
        image: imgHomeTranslator,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_my_children_title')}`,
        key: keyChildren,
        image: imgHomeChildren,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: true,
      },
      {
        title: `${i18n.t('home_screen_shrh_title')}`,
        key: keyShrh,
        image: imgHomeShrh,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_my_pregnancy_title')}`,
        key: keyPregnancy,
        image: imgHomePregnancy,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: true,
      },
      {
        title: `${i18n.t('home_screen_emergency_call_title')}`,
        key: keyEmergencyCall,
        image: imgHomeEmergencyCall,
        textColor: color.red,
        backgroundColor: color.emergencyred,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_health_records_title')}`,
        key: keyHealthRecords,
        image: imgHomeHealthRecords,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: true,
      },
      {
        title: `${i18n.t('home_screen_health_tips_news_title')}`,
        key: keyHealthTipsNews,
        image: imgHomeHealthTipsNews,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_nearby_health_centers_title')}`,
        key: keyHealthCenters,
        image: imgHomeNearbyHealthCenters,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_facebook_group_title')}`,
        key: keyFacebook,
        image: I18nManager.isRTL ? imgFacebookFlipped : imgFacebook,
        textColor: '#1877F2',
        backgroundColor: color.blue,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_settings_title')}`,
        key: keySettings,
        image: imgHomeSettings,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: false,
      },
      {
        title: `${i18n.t('home_screen_feedback_title')}`,
        key: keyFeedback,
        image: imgHomeFeedback,
        textColor: color.primary,
        backgroundColor: color.white,
        requiredSignedIn: false,
      },
    ]);
  }, [i18n]);

  function openModal(modal) {
    modal.current.setModalVisible(true);
  }

  const onItemClick = async item => {
    switch (item.key) {
      case keyWhatsappHotline:
        Linking.openURL(`https://wa.me/13613147388`);
        break;
      case keyFeedback:
        navigation.navigate('feedback');
        break;
      case keyAppointments:
        if (item.requiredSignedIn && !isSignedIn) {
          askForSignInApproval(t('home_screen_need_to_sign_in_appointments'));
        } else {
          navigation.navigate('myAppointments');
        }
        break;
      case keyPregnancy:
        if (item.requiredSignedIn && !isSignedIn) {
          askForSignInApproval(t('home_screen_need_to_sign_in_pregnancy'));
        } else {
          navigation.navigate('myPregnancy');
        }
        break;
      case keyHealthRecords:
        navigation.navigate('healthRecords');
        break;
      case keyChildren:
        if (item.requiredSignedIn && !isSignedIn) {
          askForSignInApproval(t('home_screen_need_to_sign_in_children'));
        } else {
          navigation.navigate('myChildrenInfo');
        }
        break;
      case keyHealthCenters:
        navigation.navigate('nearbyHealthCenters');
        break;
      case keyEmergencyCall:
        DeviceCountry.getCountryCode(TYPE_TELEPHONY)
          .then(result => {
            numbers.data.forEach(element => {
              if (
                element.Country.ISOCode.toLowerCase() ===
                result.code.toLowerCase()
              ) {
                Linking.openURL('tel:' + element.Ambulance.All[0]);
              }
            });
          })
          .catch(e => {
            Linking.openURL('tel:112');
          });
        break;
      case keyHealthTipsNews:
        navigation.navigate('blog');
        break;
      case keyShrh:
        navigation.navigate('srhr');
        break;
      case keyFacebook:
        if (Platform.OS === 'ios') {
          handleOpenLink('fb://group?id=327710368767013');
        } else {
          handleOpenLink('fb://group/327710368767013');
        }
        break;
      case keySettings:
        navigation.navigate('settings');
        break;
      case keyTranslator:
        navigation.navigate('translator');
        break;
      case keySOS:
        if (i18n.language !== 'ar' && i18n.language !== 'tr') {
          Linking.openURL(`https://sosacademy.co`);
        } else {
          Linking.openURL(`https://sosacademy.co/${i18n.language}`);
        }
        break;
      default:
    }
  };

  const handleOpenLink = async url => {
    try {
      await Linking.openURL(url);
    } catch {
      await Linking.openURL('https://www.facebook.com/groups/327710368767013');
    }
  };

  return (
    <View style={styles.FULL}>
      <NavigationEvents onDidFocus={async () => loadData()} />
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <View style={{flexDirection: 'row', paddingTop: 16}}>
          <TouchableOpacity onPress={() => openModal(languagePicker)}>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 24,
                alignItems: 'center',
              }}>
              <Text style={(styles.TEXT, {fontSize: 17, color: color.primary})}>
                {i18n.t('home_screen_language_dropdown_hint')}
              </Text>
              <Image
                source={icons.selectarrow}
                style={{marginStart: 8, marginTop: 2, tintColor: color.primary}}
              />
            </View>
          </TouchableOpacity>
          {isSignedIn ? (
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'flex-end',
                paddingRight: 16,
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('myProfile')}>
                <Image
                  source={icons.profile}
                  style={{width: 25, height: 25, marginEnd: 16}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('notifications', {notifications});
                  setNotifications([]);
                }}>
                <Image
                  style={{width: 25, height: 25}}
                  source={
                    hasUnreadNotifications
                      ? icons.notificationunread
                      : icons.notification
                  }
                />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                flex: 1,
                paddingRight: 16,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
              onPress={() => {
                // I save the key 'intro' with an arbitrary value: 'no'
                // to bypass the intro screen. Because the current logic that
                // is existing in the login screen, is to display the intro screen
                // if the 'intro' key has a null value.
                save('intro', 'no').then(d => navigation.navigate('login'));
              }}>
              <Image
                source={icons.profile}
                style={{width: 25, height: 25, marginEnd: 0}}
              />
              <Text
                style={{
                  color: color.primary,
                  marginStart: 12,
                  fontFamily: 'Roboto-Bold',
                }}>
                {t('home_screen_sign_in')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={[
            styles.HOME_TOOLBAR,
            {flexDirection: 'row', alignItems: 'center'},
          ]}>
          <Image
            style={{marginStart: 8, width: 55, height: 55}}
            resizeMode="contain"
            source={imgLogoSmall}
          />
          <Text
            style={{
              color: color.primary,
              marginStart: 12,
              fontSize: 32,
              fontFamily: 'Roboto-Bold',
            }}>
            {i18n.t('visit_hera_web_screen_toolbar_title')}
          </Text>
        </View>
      </SafeAreaView>
      <View>
        {!isWhatsappOptIn && isSignedIn ? (
          <WhatsappOptIn
            fullPhoneNumber={fullPhoneNumber}
            onConsent={() => {
              setWhatsappOptIn(true);
            }}
          />
        ) : (
          <></>
        )}
      </View>
      <View
        style={[styles.HOME_CONTAINER, {paddingTop: 8, paddingHorizontal: 8}]}>
        <FlatList
          data={dataSource}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{height: 160, flex: 0.5}}
              onPress={() => onItemClick(item)}>
              <View
                style={{
                  margin: 8,
                  flex: 1,
                  padding: 12,
                  backgroundColor: item.backgroundColor,
                  borderRadius: 8,
                }}>
                <Image
                  style={[
                    {position: 'absolute', bottom: 0, right: 0},
                    styles.RTL,
                  ]}
                  source={item.image}
                />
                <Text
                  style={{
                    color: item.textColor,
                    fontWeight: '700',
                    fontSize: 20,
                    fontFamily: 'Roboto-Bold',
                    textAlign: 'left',
                  }}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          numColumns={2}
        />
      </View>
      {surveys.length > 0 && (
        <Modal isVisible={true} animationIn="fadeIn" animationOut="fadeOut">
          <View style={{justifyContent: 'center', flex: 1}}>
            <View
              style={{
                alignItems: 'center',
                paddingHorizontal: 32,
                paddingVertical: 24,
                borderRadius: 16,
                backgroundColor: '#FFD480',
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: color.black,
                  fontWeight: '700',
                  fontSize: 20,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'left',
                }}>
                {surveys[0].question}
              </Text>
              <View style={{marginTop: 20, flexDirection: 'row'}}>
                <View style={{width: 100}}>
                  <TouchableOpacity
                    onPress={() => {
                      postSurvey(surveys[0].id, surveys[0].options[1].code);
                      setSurveys(surveys.slice(1));
                    }}
                    style={styles.BUTTON_ALT}>
                    <Text style={styles.BUTTON_TEXT_ALT}>
                      {surveys[0].options[1].translated_text}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{width: 20}} />
                <View style={{width: 100}}>
                  <TouchableOpacity
                    onPress={() => {
                      postSurvey(surveys[0].id, surveys[0].options[0].code);
                      setSurveys(surveys.slice(1));
                    }}
                    style={styles.BUTTON}>
                    <Text style={styles.BUTTON_TEXT}>
                      {surveys[0].options[0].translated_text}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <Picker
        ref={languagePicker}
        data={translatedLanguageOptions}
        label={'Select Language'}
        value={language}
        onValueChange={value => {
          let selectedLanguage = '';
          setLanguage(value);
          save('my_appointments_need_refetch', true);
          switch (value) {
            case 'English':
            case 'الأنكليزية':
            case 'İngilizce':
            case 'انگلیسی':
            case 'انګليسي':
              selectedLanguage = 'English';
              i18n.changeLanguage('en');
              I18nManager.forceRTL(false);
              break;
            case 'Arabic':
            case 'العربية':
            case 'Arapça':
            case 'عربی':
            case 'عربي':
              selectedLanguage = 'Arabic';
              i18n.changeLanguage('ar');
              I18nManager.forceRTL(true);
              break;
            case 'Turkish':
            case 'التركية':
            case 'Türkçe':
            case 'ترکی':
            case 'ترکي':
              selectedLanguage = 'Turkish';
              i18n.changeLanguage('tr');
              I18nManager.forceRTL(false);
              break;
            case 'Dari':
            case 'داري':
            case 'Dari':
            case 'دری':
            case 'دري':
              selectedLanguage = 'Dari';
              i18n.changeLanguage('prs');
              I18nManager.forceRTL(true);
              break;
            case 'Pashto':
            case 'الباشتو':
            case 'Peştuca':
            case 'پښتو':
            case 'پښتو':
              selectedLanguage = 'Pashto';
              i18n.changeLanguage('pus');
              I18nManager.forceRTL(true);
              break;
          }
          setupTiles();
          saveString('language', selectedLanguage).then(() => {
            saveString('updatelanguage', 'true').then(() => {
              RNRestart.Restart();
            });
          });
        }}
      />
    </View>
  );
};
