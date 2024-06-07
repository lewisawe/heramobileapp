import {StyleSheet, Dimensions} from 'react-native';
import {color, styles} from '../../theme';

export default StyleSheet.create({
  modalBody: {
    backgroundColor: '#FFD480',
    minHeight: Dimensions.get('window').height / 4,
    width: Dimensions.get('window').width / 1.1,
    alignItems: 'center',
    padding: 8,
    maxHeight: Dimensions.get('window').height - 120,
    borderRadius: 16,
  },
  modalTitle: {
    color: color.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 24,
    paddingHorizontal: 8,
    lineHeight: 29,
    width: '90%',
  },
  submitButton: {
    ...styles.BUTTON,
    paddingHorizontal: 8,
    marginVertical: 12,
    width: '40%',
  },
  buttonsContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  cancelButton: {
    ...styles.BUTTON_ALT,
    paddingHorizontal: 8,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: color.primary,
    width: '40%',
  },
});
