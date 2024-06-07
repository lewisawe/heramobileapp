import {Dimensions, StyleSheet} from 'react-native';
import {color} from '../../theme';

export default StyleSheet.create({
  screenBody: {
    position: 'relative',
  },
  screenTitle: {marginBottom: 43},
  translatorScreenBodyRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  translatorScreenBodyColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  translationsBody: {paddingHorizontal: 8},
  selectFieldContainer: {width: 114},
  selectFieldTitle: {alignSelf: 'center', marginBottom: 8},
  selectFieldOptionBody: {
    height: 52,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectFieldOptionText: {
    fontSize: 16,
  },
  translationsItem: {
    marginVertical: 11,
  },
  tapToTalkButton: {
    alignSelf: 'center',
    borderWidth: 1,
    width: 168,
    height: 168,
    borderRadius: 168 / 2,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToTalkButtonImage: {
    width: 49,
    height: 49,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  translationLanguagesModalBody: {
    backgroundColor: color.white,
    width: Dimensions.get('window').width * 0.8,
  },
  crossLanguagesIcon: {width: 24, height: 24, resizeMode: 'contain'},
  speakerIcon: {
    width: 20,
    height: 20,
  },
  translateText: {
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
    marginBottom: 3,
  },
});
