import {View, Text, TouchableOpacity} from 'react-native';
import {disableModal} from '../../../store/actions/modal';
import {useDispatch} from 'react-redux';
import {styles} from '../../theme';
import style from './style';

export const YesNoModal = ({message, yesTitle, noTitle, onOKClicked}) => {
  const dispatch = useDispatch();

  const onOKClickedHandler = () => {
    if (onOKClicked) {
      onOKClicked();
    }
    dispatch(disableModal(false));
  };

  return (
    <View style={style.modalBody}>
      <Text style={style.modalTitle}>{message}</Text>
      <View style={style.buttonsContainer}>
        <TouchableOpacity
          onPress={() => onOKClickedHandler()}
          style={style.submitButton}>
          <Text style={styles.BUTTON_TEXT}>{yesTitle}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            dispatch(disableModal(false));
          }}
          style={style.cancelButton}>
          <Text style={[styles.BUTTON_TEXT_ALT]}>{noTitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
