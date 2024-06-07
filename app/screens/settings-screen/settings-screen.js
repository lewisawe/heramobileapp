import {useState, useEffect, createRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  I18nManager,
  SafeAreaView,
} from 'react-native';
import {color, icons, styles} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {
  keyContactUs,
  keyEditProfile,
  keyFAQ,
  keyKVKK,
  keyUserAgreement,
  keyVisitHeraWeb,
  keyChangeLanguage,
  languageOptions,
} from '../../store/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OneSignal from 'react-native-onesignal';
import {useTranslation} from 'react-i18next';
import RNRestart from 'react-native-restart';
import {saveString, loadString, save} from '../../../utils/storage';
import {Picker} from '../../components/select-field';
import {userService} from '@services/user-service';

export const SettingsScreen = ({navigation}) => {
  const {i18n, t} = useTranslation();

  const [dataSource, setDataSource] = useState([]);
  const [language, setLanguage] = useState('');
  const languagePickerSettings = createRef();
  const [userid, setUserid] = useState('');

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

  const languageSwitcher = useCallback(
    languageValue => {
      let languageName = '',
        languageKey = '',
        forceRTL = false;
      setLanguage(languageValue);
      switch (languageValue) {
        case t('language_dropdown_english_text'):
          languageName = 'English';
          languageKey = 'en';
          break;
        case t('language_dropdown_arabic_text'):
          languageName = 'Arabic';
          languageKey = 'ar';
          forceRTL = true;
          break;
        case t('language_dropdown_turkish_text'):
          languageName = 'Turkish';
          languageKey = 'tr';
          break;
        case t('language_dropdown_dari_text'):
          languageName = 'Dari';
          languageKey = 'prs';
          forceRTL = true;
          break;
        case t('language_dropdown_pashto_text'):
          languageName = 'Pashto';
          languageKey = 'pus';
          forceRTL = true;
          break;
        default:
          languageName = 'English';
          languageKey = 'en';
      }
      i18n.changeLanguage(languageKey);
      I18nManager.forceRTL(forceRTL);
      save('my_appointments_need_refetch', true);
      saveString('language', languageName).then(() => {
        saveString('updatelanguage', 'true').then(() => {
          userService.updateUserLanguage(userid, languageKey).then(() => {
            RNRestart.Restart();
          });
        });
      });
    },
    [i18n, t, userid],
  );

  useEffect(() => {
    loadString('userid').then(uid => {
      setUserid(uid);
    });
  }, []);

  useEffect(() => {
    setDataSource([
      /*{
        title: `${t('settings_screen_edit_profile_title')}`,
        key: keyEditProfile,
        textColor: color.primary,
        backgroundColor: color.white,
      },*/
      {
        title: `${t('settings_screen_change_language_title')}`,
        key: keyChangeLanguage,
        textColor: color.primary,
        backgroundColor: color.white,
      },
      {
        title: `${t('settings_screen_contact_us_title')}`,
        key: keyContactUs,
        textColor: color.primary,
        backgroundColor: color.white,
      },
      {
        title: `${t('settings_screen_visit_hera_web_title')}`,
        key: keyVisitHeraWeb,
        textColor: color.primary,
        backgroundColor: color.white,
      },
      {
        title: `${t('settings_screen_faq_title')}`,
        key: keyFAQ,
        textColor: color.primary,
        backgroundColor: color.white,
      },
      {
        title: `${t('settings_screen_user_agreement_title')}`,
        key: keyUserAgreement,
        textColor: color.primary,
        backgroundColor: color.white,
      },
      {
        title: `${t('settings_screen_kvkk_title')}`,
        key: keyKVKK,
        textColor: color.primary,
        backgroundColor: color.white,
      },
    ]);
  }, [t]);

  const onItemClick = item => {
    switch (item.key) {
      case keyEditProfile:
        navigation.navigate('myProfile');
        break;
      case keyContactUs:
        navigation.navigate('contactUs');
        break;
      case keyVisitHeraWeb:
        navigation.navigate('heraWebsite');
        break;
      case keyFAQ:
        navigation.navigate('faq');
        break;
      case keyUserAgreement:
        navigation.navigate('userAgreement');
        break;
      case keyKVKK:
        navigation.navigate('kvkk');
        break;
      case keyChangeLanguage:
        openModal(languagePickerSettings);
        break;
      default:
    }
  };

  function openModal(modal) {
    modal.current.setModalVisible(true);
  }

  const arrowStyle = {
    position: 'absolute',
    right: 10,
  };

  const logout = () => {
    // Remove External User Id with Callback Available in SDK Version 3.7.0+
    OneSignal.removeExternalUserId(results => {
      // The results will contain push and email success statuses
      console.log('Results of removing external user id');
      console.log(results);
      // Push can be expected in almost every situation with a success status, but
      // as a pre-caution its good to verify it exists
      if (results.push && results.push.success) {
        console.log('Results of removing external user id push status:');
        console.log(results.push.success);
      }

      // Verify the email is set or check that the results have an email success status
      if (results.email && results.email.success) {
        console.log('Results of removoing external user id email status:');
        console.log(results.email.success);
      }
    });

    AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys))
      .then(() => {
        I18nManager.forceRTL(false);
        RNRestart.Restart();
      });
  };

  const FlatListItemSeparator = useMemo(() => {
    return () => (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: color.background,
        }}
      />
    );
  }, []);

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('settings_screen_toolbar_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <View style={{backgroundColor: color.background, flex: 1}}>
        <FlatList
          style={{marginTop: 8}}
          ItemSeparatorComponent={FlatListItemSeparator}
          data={dataSource}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => onItemClick(item)}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 20,
                  backgroundColor: item.backgroundColor,
                }}>
                <Text
                  style={{
                    color: item.textColor,
                    fontSize: 16,
                    fontFamily: 'Roboto-Medium',
                  }}>
                  {item.title}
                </Text>
                <Image
                  source={icons.chevroncell}
                  style={[arrowStyle, styles.RTL]}
                />
              </View>
            </TouchableOpacity>
          )}
        />
        {userid ? (
          <View style={{flex: 1, marginHorizontal: 16}}>
            <TouchableOpacity
              onPress={() => logout()}
              style={styles.BUTTON_ALT}>
              <Text style={styles.BUTTON_TEXT_ALT}>
                {t('settings_screen_logout_button')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <></>
        )}
        <Picker
          ref={languagePickerSettings}
          data={translatedLanguageOptions}
          label={t('login_screen_select_language_dropdown_hint')}
          value={language}
          onValueChange={languageSwitcher}
        />
      </View>
    </View>
  );
};
