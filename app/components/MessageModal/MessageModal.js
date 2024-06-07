import {View, Text, TouchableOpacity} from 'react-native';
import {disableModal} from '../../../store/actions/modal';
import {useDispatch} from 'react-redux';
import {styles} from '../../theme';
import style from './style';

export const MessageModal = ({message, onCloseClicked}) => {
  const dispatch = useDispatch();

  const onCloseClickedHandler = () => {
    if (onCloseClicked) {
      onCloseClicked();
    }
    dispatch(disableModal(false));
  };

  return (
    <View style={style.modalBody}>
      <Text style={style.modalTitle}>{message}</Text>
      <View style={style.buttonsContainer}>
        <TouchableOpacity
          onPress={() => onCloseClickedHandler()}
          style={style.submitButton}>
          <Text style={styles.BUTTON_TEXT}>{'close'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
