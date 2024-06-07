import {StyleSheet} from 'react-native';
import {color} from '../../theme';

export const style = StyleSheet.create({
  versionNumber: {
    marginTop: 20,
    fontSize: 14,
    color: color.hint,
    alignSelf: 'center',
    letterSpacing: 3,
  },
  screenTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '700',
    color: color.primary,
    alignSelf: 'center',
    fontFamily: 'Roboto-Regular',
  },
  languageDropdownContainer: {
    marginTop: 40,
  },
  countryPickerContainer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  countryPickerInputContainer: {
    flex: 1,
    marginStart: 15,
  },
  countryPickerSelectFieldContainer: {
    width: 70,
  },
  imgFamily: {alignSelf: 'center'},
  countryPickerInput: {borderBottomColor: color.primary},
  logoImage: {marginTop: 40, alignSelf: 'center'},
  fixedWidthView: {width: 20},
  loginBtnContainer: {flex: 1},
  loadingGif: {width: 100, height: 100, borderRadius: 20},
});
