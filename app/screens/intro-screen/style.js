import {StyleSheet} from 'react-native';
import {Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;

export const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    width: windowWidth,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD480',
    paddingBottom: 50,
  },
  image: {
    width: windowWidth * 0.64,
    height: windowWidth * 1.22,
    resizeMode: 'contain',
  },
  text: {
    paddingHorizontal: windowWidth / 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 35,
    fontSize: 16,
  },
  sliderNavButtonText: {
    color: '#000',
    fontSize: 17,
    paddingTop: 15,
    fontWeight: '600',
  },
  dot: {
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
  },
  activeDot: {
    backgroundColor: '#6A2081',
    borderColor: '#6A2081',
  },
});
