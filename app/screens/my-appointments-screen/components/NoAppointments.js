import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import style from '../style';

export function NoAppointments() {
  const {t} = useTranslation();

  return (
    <View style={style.blankViewContainer}>
      <Text style={style.blankTitle}>{t('no_appointments_note_title')}</Text>
      <Text style={style.blankDescription}>
        {t('no_appointments_note_description')}
      </Text>
    </View>
  );
}
