import {StyleSheet, Dimensions} from 'react-native';

export default StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFD480',
    margin: 12,
    height: 63,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  icon: {
    width: '15%',
    resizeMode: 'contain',
  },
  alertText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    width: '80%',
  },
  modalContainer: {
    height: Dimensions.get('window').height * 0.25,
    backgroundColor: '#FFD480',
  },
  modalContentText: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  buttonText: {paddingVertical: 12, paddingHorizontal: 32},
});
