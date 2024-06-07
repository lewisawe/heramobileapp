import {useEffect, useState, createRef} from 'react';
import {color, styles, gifLoading} from '../../../theme';
import {ToolBar} from '../../../components/toolbar';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  I18nManager,
  SafeAreaView,
  Platform,
} from 'react-native';
import {Input} from 'react-native-elements';
import {SelectField, Picker} from '../../../components/select-field';
import {baseURL, genderOptions} from '../../../store/constants';
import CheckBox from '@react-native-community/checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {dateToString} from '../../../utils/helpers';
import {loadString} from '../../../../utils/storage';
import {useTranslation} from 'react-i18next';
import Modal from 'react-native-modal';
import GenericErrorMessage from '../../../components/GenericErrorMessage';

export const AddAChildScreen = ({navigation}) => {
  const textAlign = I18nManager.isRTL ? 'right' : 'left';
  const {t} = useTranslation();

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
  const [gender, setGender] = useState(t('gender_dropdown_female_text'));
  const [dob, setDob] = useState(new Date());
  const [dobString, setDobString] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [dobErrorMessage, setDOBErrorMessage] = useState('');
  const [token, setToken] = useState('');
  const [checked, setChecked] = useState([]);
  const [loading, setLoading] = useState(false);

  let genderPicker = createRef();

  const isItemChecked = vaccineId => {
    return checked.indexOf(vaccineId) > -1;
  };

  const manageToggle = (evt, vaccineId) => {
    if (isItemChecked(vaccineId)) {
      setChecked(checked.filter(i => i !== vaccineId));
    } else {
      setChecked([...checked, vaccineId]);
    }
  };

  const createChild = () => {
    if (name.length === 0) {
      setNameErrorMessage(
        t('complete_profile_screen_error_message_name_required'),
      );
    } else {
      setNameErrorMessage('');
    }

    if (dobString.length === 0) {
      setDOBErrorMessage(
        t('complete_profile_screen_error_message_dob_required'),
      );
    } else {
      setDOBErrorMessage('');
    }

    if (name.length === 0 || dobString.length === 0) {
      return;
    }

    setLoading(true);

    let genderRequest = '';
    if (gender === 'Male' || gender.charAt(0) === 'ذ' || gender === 'Erkek') {
      genderRequest = 'MALE';
    } else {
      genderRequest = 'FEMALE';
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({
        name,
        date_of_birth: dobString,
        gender: genderRequest,
        past_vaccinations: checked,
      }),
    };

    fetch(baseURL + '/children/', requestOptions)
      .then(response => {
        setLoading(false);
        if (!response.ok) {
          throw new Error();
        } else {
          return response.json();
        }
      })
      .then(data => {
        navigation.navigate('childrenInfo', {
          token,
          navigation,
          addedChild: data,
          deleted: false,
        });
      })
      .catch(e => {});
  };

  const getVaccines = authToken => {
    setLoading(true);
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + authToken,
      },
    };
    fetch(baseURL + '/vaccines/', requestOptions)
      .then(response => {
        setLoading(false);
        return response.json();
      })
      .then(data => {
        setVaccines(data);
      });
  };

  useEffect(() => {
    async function getToken() {
      const authToken = await loadString('token');
      setToken(authToken);
      getVaccines(authToken);
    }
    getToken();
  }, []);

  function openModal(modal) {
    modal.current.setModalVisible(true);
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
          maximumDate={new Date()}
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
          maximumDate={new Date()}
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

  const renderVaccines = () => {
    return (
      <View>
        {vaccines.map(vaccine => (
          <TouchableOpacity
            key={`vaccine-${vaccine.id}`}
            onPress={() => {
              manageToggle(null, vaccine.id);
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 24,
              }}>
              <CheckBox
                style={{width: 30, height: 30, marginEnd: 16}}
                tintColor={color.primary}
                onFillColor={color.primary}
                onTintColor={color.primary}
                onCheckColor={color.white}
                tintColors={{true: color.primary}}
                animationDuration={0.1}
                boxType="square"
                value={isItemChecked(vaccine.id)}
              />
              <Text style={(styles.TEXT, {fontSize: 16})}>{vaccine.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('add_a_child_screen_toolbar_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <ScrollView>
        <View style={styles.CONTAINER}>
          <View>
            <Input
              textAlign={textAlign}
              inputStyle={styles.NOPADMARGIN}
              containerStyle={styles.NOPADMARGIN}
              inputContainerStyle={{borderBottomColor: color.primary}}
              editable={true}
              placeholder={t('add_a_child_screen_name_hint')}
              onChangeText={setName}
            />
          </View>
          <GenericErrorMessage message={nameErrorMessage} />
          <View style={{marginTop: 20}}>
            <SelectField
              onChangeText={setDob}
              placeholder={t('add_a_child_screen_date_of_birth_hint')}
              value={dobString ? dobString.split('-').reverse().join('-') : ''}
              onSelect={() => setDatePickerVisible(true)}
              mandatory
            />
          </View>
          <GenericErrorMessage message={dobErrorMessage} />
          <View style={{marginTop: 20}}>
            <SelectField
              onChangeText={setGender}
              value={gender}
              onSelect={() => openModal(genderPicker)}
              mandatory
            />
          </View>
          <Text
            style={[
              styles.TEXT,
              {fontWeight: '700', marginTop: 20, marginBottom: 16},
            ]}>
            {t('add_a_child_screen_past_vaccinations_title')}
          </Text>
          {renderVaccines()}
          <View style={{marginTop: 20}}>
            <TouchableOpacity
              onPress={() => createChild()}
              style={styles.BUTTON}>
              <Text style={styles.BUTTON_TEXT}>
                {t('add_a_child_screen_submit_button')}
              </Text>
            </TouchableOpacity>
          </View>
          <Picker
            ref={genderPicker}
            data={translatedGenderOptions}
            label={'Select Gender'}
            value={gender}
            onValueChange={setGender}
          />
          {isDatePickerVisible && segmentDatePicker()}
        </View>
      </ScrollView>
      {loading && (
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
