import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {useCallback, useEffect, useState} from 'react';

import Voice from '@react-native-voice/voice';

import {ToolBar} from '../../components/toolbar';
import {t} from 'i18next';
import {
  crossArrowsIcon,
  disabledMicrophone,
  enabledMicrophone,
  speakerIcon,
  styles,
} from '../../theme';
import {SelectField} from '../../components/select-field';
import {disableModal, enableModal} from '../../../store/actions/modal';
import {useDispatch} from 'react-redux';
import {languages} from '../../utils/helpers';
import axios from 'axios';
import style from './style';
import {baseURL, languageOptions} from '../../store/constants';
import Sound from 'react-native-sound';

export default function TranslatorScreen({navigation}) {
  const dispatch = useDispatch();
  const [isRecording, setRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [translationResults, setTranslationResults] = useState([]);

  const [translationOptions, setTranslationOptions] = useState({
    from: {key: languages.Turkish.key, value: languages.Turkish.value},
    to: {key: languages.Arabic.key, value: languages.Arabic.value},
  });

  const getTranslation = useCallback(
    async text => {
      try {
        const {from, to} = translationOptions;
        if (from.key === to.key) {
          setTranslationResults(prev =>
            [
              ...prev,
              {
                input: Platform.OS === 'android' ? text : speechText,
                translatedText: Platform.OS === 'android' ? text : speechText,
                from: from.key,
                to: to.key,
                keyValue: new Date().getTime(),
              },
            ].reverse(),
          );
        } else {
          if (text || speechText) {
            const {data} = await axios({
              url: '/translation_glossary/',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              data: {
                content: Platform.OS === 'android' ? text : speechText,
                target: to.key,
                source: from.key,
              },
            });

            setTranslationResults(prev =>
              [
                ...prev,
                {
                  input: data.input,
                  translatedText: data.translated_text,
                  from: data.source_language,
                  to: data.target_language,
                  keyValue: new Date().getTime(),
                },
              ].reverse(),
            );
          }
        }
      } catch (e) {
        throw new Error(e);
      }
    },
    [speechText, translationOptions],
  );

  const switchLanguage = useCallback(() => {
    const {from, to} = translationOptions;
    setTranslationOptions({from: to, to: from});
  }, [translationOptions]);

  const startSpeechToText = useCallback(async () => {
    await Voice.start(translationOptions.from.key);
    setRecording(true);
  }, [translationOptions.from.key]);

  /* stopSpeechToText - Works only with IOS Platform */
  const stopSpeechToText = useCallback(async () => {
    if (Platform.OS === 'ios' && speechText) {
      await getTranslation(speechText);
    }
    onSpeechEnd();
  }, [getTranslation, onSpeechEnd, speechText]);

  const onSpeechResults = useCallback(
    async ({value}) => {
      if (Platform.OS === 'android' && value[0]) {
        await getTranslation(value[0]);
      }
      setSpeechText(value[0]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [getTranslation],
  );

  const onSpeechError = useCallback(({error}) => {
    Voice.destroy().then(Voice.removeAllListeners());
    setRecording(false);
    Alert.alert(error.message);
  }, []);

  const onSpeechEnd = useCallback(async () => {
    await Voice.stop();
    setRecording(false);
  }, []);

  const onSelectFieldLanguageFrom = useCallback(() => {
    return dispatch(
      enableModal(true, () => (
        <View style={style.translationLanguagesModalBody}>
          {languageOptions
            .filter(option => option !== 'Dari' && option !== 'Pashto')
            .map(option => (
              <TouchableOpacity
                key={option}
                style={style.selectFieldOptionBody}
                onPress={() => {
                  setTranslationOptions(prev => ({
                    ...prev,
                    from: languages[option],
                  }));
                  dispatch(disableModal(false));
                }}>
                <Text style={style.selectFieldOptionText}>
                  {languages[option].value}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )),
    );
  }, [dispatch]);

  const onSelectFieldLanguageTo = useCallback(() => {
    return dispatch(
      enableModal(true, () => (
        <View style={style.translationLanguagesModalBody}>
          {languageOptions
            .filter(option => option !== 'Dari' && option !== 'Pashto')
            .map(option => (
              <TouchableOpacity
                key={option}
                style={style.selectFieldOptionBody}
                onPress={() => {
                  setTranslationOptions(prev => ({
                    ...prev,
                    to: languages[option],
                  }));
                  dispatch(disableModal(false));
                }}>
                <Text style={style.selectFieldOptionText}>
                  {languages[option].value}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )),
    );
  }, [dispatch]);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners());
    };
  }, [onSpeechEnd, onSpeechError, onSpeechResults]);

  const speak = useCallback(async (translatedText, to) => {
    try {
      playMusic(
        `${baseURL}/text_to_speech?source=${to}&content=${translatedText}`,
      );
    } catch (e) {
      throw new Error(e);
    }
  }, []);

  const playMusic = music => {
    Sound.setCategory('Playback');
    const speech = new Sound(music, '', error => {
      if (error) {
        console.warn('failed to load the sound', error);

        return null;
      }
      speech.play(success => {
        if (!success) {
          console.warn('playback failed due to audio decoding errors');
        }
      });
      return null;
    });
  };

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('home_screen_translator_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <View style={styles.CONTAINER}>
        {translationResults.length === 0 && (
          <Text style={[{...styles.TEXT, ...style.screenTitle}]}>
            {t('translator_screen_title')}
          </Text>
        )}
        <View
          style={
            translationResults.length > 0
              ? style.translatorScreenBodyRow
              : style.translatorScreenBodyColumn
          }>
          <View style={style.selectFieldContainer}>
            <Text style={style.selectFieldTitle}>
              {t('translator_screen_translate_from_text')}
            </Text>
            <SelectField
              value={translationOptions.from.value}
              onSelect={onSelectFieldLanguageFrom}
            />
          </View>
          {translationResults.length > 0 && (
            <TouchableOpacity onPress={switchLanguage}>
              <Image
                source={crossArrowsIcon}
                style={style.crossLanguagesIcon}
              />
            </TouchableOpacity>
          )}
          <View style={style.selectFieldContainer}>
            <Text style={style.selectFieldTitle}>
              {t('translator_screen_translate_to_text')}
            </Text>
            <SelectField
              value={translationOptions.to.value}
              onSelect={onSelectFieldLanguageTo}
            />
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={style.translationsBody}>
          {translationResults.map(
            ({input, translatedText, from, to, keyValue}) => (
              <View
                key={`${input} - ${translatedText} - ${keyValue}`}
                style={style.translationsItem}>
                <Text style={style.translateText}>
                  {from.toUpperCase()} : {input}
                </Text>
                <Text style={style.translateText}>
                  {to.toUpperCase()} : {translatedText}
                </Text>
                <TouchableOpacity onPress={() => speak(translatedText, to)}>
                  <Image source={speakerIcon} style={style.speakerIcon} />
                </TouchableOpacity>
              </View>
            ),
          )}
        </ScrollView>
        <TouchableOpacity
          onPress={!isRecording ? startSpeechToText : stopSpeechToText}
          style={style.tapToTalkButton}>
          <Image
            source={isRecording ? disabledMicrophone : enabledMicrophone}
            style={style.tapToTalkButtonImage}
          />
          <Text style={styles.BUTTON_TEXT}>
            {t(
              isRecording
                ? 'translator_screen_stop_btn'
                : 'translator_screen_push_to_talk_btn',
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
