import {createRef, useEffect, useState} from 'react';
import {color, styles, icons} from '../../../theme';
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
import {loadString, save} from '../../../../utils/storage';
import {baseURL, genderOptions} from '../../../store/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {dateToString} from '../../../utils/helpers';
import CheckBox from '@react-native-community/checkbox';
import {useTranslation} from 'react-i18next';
import {gifLoading} from '../../../theme';
import Modal from 'react-native-modal';
import {useSelector} from 'react-redux';

import {filterChildData} from '../../../utils/children';
import {useMemo} from 'react';
import {useUpdateChild} from '../../../hooks';

export const MyChildInfoScreen = ({navigation}) => {
  let editChild = navigation.state.params.editChild
    ? navigation.state.params.editChild
    : null;

  const genderPicker = createRef();
  const {t} = useTranslation();
  const textAlign = I18nManager.isRTL ? 'right' : 'left';
  const childs = useSelector(state => state.childs);
  const {updateVaccine} = useUpdateChild();

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
    return t(key) === 'Kadın' ? 'Kız' : t(key);
  });

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(new Date());
  const [dobString, setDobString] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [dobErrorMessage, setDOBErrorMessage] = useState('');
  const [token, setToken] = useState('');
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [vaccineObjects, setVaccineObjects] = useState([]);

  const child = useMemo(
    () => editChild !== null && filterChildData(childs, editChild),
    [childs, editChild],
  );

  useEffect(() => {
    const tmp = [];
    vaccines.forEach(vaccine => {
      tmp.push({
        ...vaccine,
        isChecked: child.past_vaccinations.indexOf(vaccine.id) > -1,
      });
    });
    setVaccineObjects(tmp);
  }, [child, vaccines]);

  const isItemChecked = vaccineId => {
    return vaccineObjects.filter(v => v.id === vaccineId)[0].isChecked;
  };

  const manageToggle = (evt, vaccineId) => {
    const flag = isItemChecked(vaccineId);
    if (flag) {
      vaccineObjects.filter(v => v.id === vaccineId)[0].isChecked = false;
    } else {
      vaccineObjects.filter(v => v.id === vaccineId)[0].isChecked = true;
    }
    setVaccineObjects(vaccineObjects);
  };

  useEffect(() => {
    async function getToken() {
      await loadString('token').then(authToken => {
        setToken(authToken);
        getVaccines(authToken);
      });
    }
    getToken();
    if (editChild) {
      setName(editChild.name);
      setDobString(editChild.date_of_birth);

      if (editChild.gender === 'MALE') {
        setGender(t('gender_dropdown_male_text'));
      } else {
        setGender(
          t('gender_dropdown_female_text') === 'Kadın'
            ? 'Kız'
            : t('gender_dropdown_female_text'),
        );
      }
    }
  }, [editChild, t]);

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

  const updateChild = () => {
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
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
      body: JSON.stringify({
        name,
        date_of_birth: dobString,
        gender: genderRequest,
        past_vaccinations: vaccineObjects
          .filter(v => v.isChecked)
          .map(v => v.id),
      }),
    };
    fetch(baseURL + '/children/' + editChild.id + '/', requestOptions)
      .then(response => {
        setLoading(false);
        if (!response.ok) {
          throw new Error();
        } else {
          return response.json();
        }
      })
      .then(data => {
        save('my_appointments_need_refetch', true);
        navigation.navigate('myChildrenInfo', {
          token,
          deleted: false,
          edited: true,
        });
      })
      .catch(e => {
        setErrorMessage(t('generic_error_message_text'));
      });
  };

  const deleteChild = () => {
    setLoading(true);
    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
      },
    };
    fetch(baseURL + '/children/' + editChild.id + '/', requestOptions)
      .then(response => {
        setLoading(false);
        if (!response.ok) {
          throw new Error();
        } else {
          save('my_appointments_need_refetch', true);
          navigation.navigate('myChildrenInfo', {token, deleted: true});
        }
      })
      .catch(e => {
        setErrorMessage(t('generic_error_message_text'));
      });
  };

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

  const showErrorMessage = message => {
    if (message) {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={icons.error} style={{marginEnd: 8}} />
          <Text style={styles.ERROR_STYLE}>{message}</Text>
        </View>
      );
    }
  };

  const renderVaccines = () => {
    return (
      <View>
        {vaccineObjects.map(vaccine => (
          <TouchableOpacity
            key={`vaccine-${vaccine.id}`}
            onPress={() => {
              manageToggle(null, vaccine.id);
              updateVaccine(vaccine.id, child);
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
                value={vaccine.isChecked}
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
          title={t('child_info_screen_toolbar_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <ScrollView>
        <View style={styles.CONTAINER}>
          {showErrorMessage(errorMessage)}
          <Text style={[styles.TEXT, {fontWeight: '700'}]}>
            {t('child_info_screen_name_title')}
          </Text>
          <View style={{marginTop: 10}}>
            <Input
              textAlign={textAlign}
              inputStyle={styles.NOPADMARGIN}
              containerStyle={styles.NOPADMARGIN}
              inputContainerStyle={{borderBottomColor: color.primary}}
              editable={true}
              placeholder={t('child_info_screen_name_hint')}
              onChangeText={setName}
              value={name}
            />
          </View>
          {showErrorMessage(nameErrorMessage)}
          <Text style={[styles.TEXT, {marginTop: 20, fontWeight: '700'}]}>
            {t('child_info_screen_date_of_birth_title')}
          </Text>
          <View style={{marginTop: 10}}>
            <SelectField
              onChangeText={setDob}
              placeholder={t('child_info_screen_date_of_birth_hint')}
              value={dobString ? dobString.split('-').reverse().join('-') : ''}
              onSelect={() => setDatePickerVisible(true)}
              mandatory
            />
          </View>
          {showErrorMessage(dobErrorMessage)}
          <Text style={[styles.TEXT, {marginTop: 20, fontWeight: '700'}]}>
            {t('child_info_screen_gender_title')}
          </Text>
          <View style={{marginTop: 10}}>
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
            {t('child_info_screen_past_vaccinations_title')}
          </Text>
          {/* <FlatList
                    data={vaccines}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                /> */}
          {renderVaccines()}
          <View style={{marginTop: 20}}>
            <TouchableOpacity
              onPress={() => updateChild()}
              style={styles.BUTTON}>
              <Text style={styles.BUTTON_TEXT}>
                {t('child_info_screen_save_button')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{marginTop: 20}}>
            <TouchableOpacity
              onPress={() => deleteChild()}
              style={styles.BUTTON_ALT}>
              <Text style={styles.BUTTON_TEXT_ALT}>
                {t('child_info_screen_remove_button')}
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
