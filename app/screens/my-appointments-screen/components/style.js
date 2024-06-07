import {StyleSheet, Dimensions} from 'react-native';
import {color, styles} from '../../../theme';

export default StyleSheet.create({
  modalBody: {
    backgroundColor: '#fff',
    minHeight: Dimensions.get('window').height / 2,
    width: Dimensions.get('window').width / 1.1,
    alignItems: 'center',
    padding: 5,
    maxHeight: Dimensions.get('window').height - 120,
  },
  modalTitle: {
    color: color.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 24,
    lineHeight: 29,
  },
  vaccinesContainer: {alignSelf: 'flex-start', width: '100%'},
  vaccine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkBox: {width: 30, height: 30, marginHorizontal: 16},
  buttonsContainer: {width: '90%'},
  submitButton: {
    ...styles.BUTTON,
    paddingHorizontal: 8,
    marginVertical: 12,
  },
  cancelButton: {
    ...styles.BUTTON_ALT,
    paddingHorizontal: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: color.primary,
  },
});
