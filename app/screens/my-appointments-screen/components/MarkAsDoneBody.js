import {useState, useEffect, useCallback, useMemo} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {disableModal} from '../../../../store/actions/modal';
import {useDispatch, useSelector} from 'react-redux';
import {color, styles} from '../../../theme';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';
import {loadString} from '../../../../utils/storage';

import {
  filterChildData,
  getVaccineId,
  checkVaccine,
} from '../../../utils/children';

import style from './style';
import {useUpdateChild} from '../../../hooks';
import {useTranslation} from 'react-i18next';

export const MarkAsDoneBody = ({data, vaccines}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const childs = useSelector(state => state.childs);
  const [token, setToken] = useState('');

  const childInfo = useMemo(
    () => filterChildData(childs, data),
    [childs, data],
  );

  const {updateVaccine} = useUpdateChild();

  const updateEvent = useCallback(
    async (event, vaccineId) => {
      try {
        if (event.event_type === 'vaccination') {
          const {date_of_birth, name, gender, past_vaccinations} = childInfo;
          const {data: response} = await axios({
            url: `/children/${childInfo.id}/`,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
            data: {date_of_birth, name, gender, past_vaccinations},
          });
          return response;
        }
      } catch (e) {
        console.error(e);
      } finally {
        dispatch(disableModal(false));
      }
    },
    [childInfo, dispatch, token],
  );

  const updateVaccineHandler = useCallback(
    vaccineName => {
      const id = getVaccineId(vaccines, vaccineName);
      updateVaccine(id, childInfo);
    },
    [childInfo, updateVaccine, vaccines],
  );

  useEffect(() => {
    const syncData = async () => {
      const authToken = await loadString('token');
      setToken(authToken);
    };
    syncData();
  }, []);

  return (
    <View style={style.modalBody}>
      <Text style={style.modalTitle}>
        {data.event_type === 'vaccination'
          ? t('mark_as_done_baby_title', {name: data.person_name})
          : t('mark_as_done_mother_title')}
      </Text>
      <ScrollView style={style.vaccinesContainer}>
        {data.event_type === 'vaccination' &&
          data.vaccine_names.map(vaccineName => (
            <TouchableOpacity
              key={`vaccine - ${vaccineName}`}
              onPress={() => updateVaccineHandler(vaccineName)}
              style={style.vaccine}>
              <CheckBox
                style={style.checkBox}
                tintColor={color.primary}
                onFillColor={color.primary}
                onTintColor={color.primary}
                onCheckColor={color.white}
                tintColors={{true: color.primary}}
                animationDuration={0.1}
                boxType="square"
                value={checkVaccine(vaccines, vaccineName, childInfo)}
                onValueChange={() => updateVaccineHandler(vaccineName)}
              />
              <Text>{vaccineName}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      <View style={style.buttonsContainer}>
        <TouchableOpacity
          onPress={() => updateEvent(data)}
          style={style.submitButton}>
          <Text style={styles.BUTTON_TEXT}>
            {data.event_type === 'vaccination'
              ? t('mark_as_done_modal_submit_btn')
              : t('mark_as_done_modal_confirm_btn')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            dispatch(disableModal(false));
          }}
          style={style.cancelButton}>
          <Text style={[styles.BUTTON_TEXT_ALT]}>
            {t('mark_as_done_modal_cancel_btn')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
