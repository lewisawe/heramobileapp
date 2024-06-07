import {useCallback, useEffect, useState} from 'react';
import {I18nManager, NativeModules, Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import RNRestart from 'react-native-restart';

import {loadString, saveString} from '@storage';
import {en, ar, tr, prs, pus} from './languageMappings.json';
import {LANGUAGE_STORAGE_KEY} from '@store/constants';

const useLanguage = () => {
  const {i18n} = useTranslation();

  const [language, setLanguage] = useState('');
  const [acceptLanguage, setAcceptLanguage] = useState('');

  useEffect(() => {
    loadString('language').then(lang => {
      switch (lang) {
        case 'English':
          setLanguage(en.name);
          setAcceptLanguage(en.acceptLanguage);
          break;
        case 'Arabic':
          setLanguage(ar.name);
          setAcceptLanguage(ar.acceptLanguage);
          break;
        case 'Turkish':
          setLanguage(tr.name);
          setAcceptLanguage(tr.acceptLanguage);
          break;
        case 'Dari':
          setLanguage(prs.name);
          setAcceptLanguage(prs.acceptLanguage);
          break;
        case 'Pashto':
          setLanguage(pus.name);
          setAcceptLanguage(pus.acceptLanguage);
          break;
        default:
          const deviceLanguage =
            Platform.OS === 'ios'
              ? NativeModules.SettingsManager.settings.AppleLocale ||
                NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
              : NativeModules.I18nManager.localeIdentifier;

          if (deviceLanguage.startsWith('en')) {
            setLanguage('English');
            saveString(LANGUAGE_STORAGE_KEY, 'English');
            setAcceptLanguage('en');
          } else if (deviceLanguage.startsWith('ar')) {
            setLanguage('العربية');
            saveString(LANGUAGE_STORAGE_KEY, 'Arabic');
            setAcceptLanguage('ar');
          } else if (deviceLanguage.startsWith('tr')) {
            setLanguage('Türkçe');
            saveString(LANGUAGE_STORAGE_KEY, 'Turkish');
            setAcceptLanguage('tr');
          } else if (deviceLanguage.startsWith('prs')) {
            setLanguage('دری');
            saveString(LANGUAGE_STORAGE_KEY, 'Dari');
            setAcceptLanguage('prs');
          } else if (deviceLanguage.startsWith('pus')) {
            setLanguage('پښتو');
            saveString(LANGUAGE_STORAGE_KEY, 'Pashto');
            setAcceptLanguage('pus');
          } else {
            setLanguage('English');
            saveString(LANGUAGE_STORAGE_KEY, 'English');
            setAcceptLanguage('en');
          }
      }
    });
  }, []);

  const setAppLanguage = useCallback(
    lang => {
      let selectedLanguage;
      setLanguage(lang);
      switch (lang) {
        case 'English':
          selectedLanguage = 'English';
          i18n.changeLanguage('en');
          I18nManager.forceRTL(false);
          break;
        case 'Arabic':
          selectedLanguage = 'Arabic';
          i18n.changeLanguage('ar');
          I18nManager.forceRTL(true);
          break;
        case 'Turkish':
          selectedLanguage = 'Turkish';
          i18n.changeLanguage('tr');
          I18nManager.forceRTL(false);
          break;
        case 'Dari':
          selectedLanguage = 'Dari';
          i18n.changeLanguage('prs');
          I18nManager.forceRTL(true);
          break;
        case 'Pashto':
          selectedLanguage = 'Pashto';
          i18n.changeLanguage('pus');
          I18nManager.forceRTL(true);
          break;
      }
      saveString('language', selectedLanguage);
      RNRestart.Restart();
    },
    [i18n],
  );
  return {acceptLanguage, language, setAppLanguage};
};

export default useLanguage;
