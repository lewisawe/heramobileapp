import {useDispatch, useSelector} from 'react-redux';
import ReactNativeModal from 'react-native-modal';
import {disableModal} from '../../../store/actions/modal';
import style from './style';

export function Modal() {
  const {showModal, children} = useSelector(state => state.modal);
  const dispatch = useDispatch();

  return (
    <ReactNativeModal
      visible={showModal}
      onBackdropPress={() => dispatch(disableModal(false))}
      animationType="fade"
      style={style}>
      {typeof children === 'function' && children()}
    </ReactNativeModal>
  );
}
