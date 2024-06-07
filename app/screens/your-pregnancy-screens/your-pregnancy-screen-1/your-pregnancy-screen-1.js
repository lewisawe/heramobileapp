import {useState, useEffect} from 'react';
import {color, styles} from '../../../theme';
import {ToolBar} from '../../../components/toolbar';
import {View, Text, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {loadString, saveString} from '../../../../utils/storage';
import {baseURL} from '../../../store/constants';

export const YourPregnancyScreen1 = ({navigation}) => {
  const {t} = useTranslation();

  const [token, setToken] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    async function getToken() {
      const [authToken, userGender] = await Promise.all([
        loadString('token'),
        loadString('userGender'),
      ]);
      setToken(authToken);
      setGender(userGender);
    }
    getToken();
  }, []);

  const updateOnboardingProgresses = () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({has_filled_pregnancy_status: true}),
    };

    fetch(baseURL + '/onboarding_progresses/', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error();
        } else {
          return response.json();
        }
      })
      .then(data => {})
      .catch(e => {});
  };

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={
            gender === 'FEMALE'
              ? t('your_pregnancy_screen_toolbar_title')
              : t('your_pregnancy_screen_toolbar_title_male')
          }
          hide={true}
          navigation={navigation}
        />
      </SafeAreaView>
      <View
        style={[
          styles.CONTAINER,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <Text
          style={{
            color: color.black,
            fontSize: 24,
            fontWeight: '700',
            fontFamily: 'Roboto-Regular',
          }}>
          {gender === 'FEMALE'
            ? t('your_pregnancy_screen_question_text_female')
            : t('your_pregnancy_screen_question_text_male')}
        </Text>
        <View style={{marginTop: 20, flexDirection: 'row'}}>
          <View style={{width: 100}}>
            <TouchableOpacity
              onPress={() => navigation.navigate('yourPregnancy2', {gender})}
              style={styles.BUTTON_ALT}>
              <Text style={styles.BUTTON_TEXT_ALT}>
                {t('your_pregnancy_screen_answer_yes_button')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{width: 20}} />
          <View style={{width: 100}}>
            <TouchableOpacity
              onPress={() => {
                updateOnboardingProgresses();
                saveString('onboardingprogress', '2');
                navigation.navigate('childrenInfo', {deleted: false});
              }}
              style={styles.BUTTON_ALT}>
              <Text style={styles.BUTTON_TEXT_ALT}>
                {t('your_pregnancy_screen_answer_no_button')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
