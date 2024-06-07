import {View, Text, Image, SafeAreaView} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {
  slider1En,
  slider2En,
  slider3En,
  slider1Tr,
  slider2Tr,
  slider3Tr,
  slider1Ar,
  slider2Ar,
  slider3Ar,
  slider1Prs,
  slider2Prs,
  slider3Prs,
  slider1Pus,
  slider2Pus,
  slider3Pus,
} from '../../theme';
import {style} from './style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import useLanguage from '@hooks/useLanguage';
import {useMemo} from 'react';
import {saveString} from '../../../utils/storage/storage';

const IntroScreen = ({navigation}) => {
  const [t] = useTranslation();
  const {acceptLanguage} = useLanguage();

  const data = useMemo(() => {
    let images = [];

    switch (acceptLanguage) {
      case 'ar':
        images = [slider1Ar, slider2Ar, slider3Ar];
        break;
      case 'tr':
        images = [slider1Tr, slider2Tr, slider3Tr];
        break;
      case 'prs':
        images = [slider1Prs, slider2Prs, slider3Prs];
        break;
      case 'pus':
        images = [slider1Pus, slider2Pus, slider3Pus];
        break;
      default:
        images = [slider1En, slider2En, slider3En];
    }
    return [
      {
        text: t('intro_screen_slider_1'),
        image: images[0],
      },
      {
        text: t('intro_screen_slider_2'),
        image: images[1],
      },
      {
        text: t('intro_screen_slider_3'),
        image: images[2],
      },
    ];
  }, [acceptLanguage, t]);

  const _renderItem = ({item}) => {
    return (
      <SafeAreaView style={style.slide}>
        <Image source={item.image} style={style.image} />
        <Text style={style.text}>{item.text}</Text>
      </SafeAreaView>
    );
  };

  const _onDone = () => {
    const items = [['intro', 'intro']];
    AsyncStorage.multiSet(items);
    saveString('is_intro_screen_displayed', 'yes');
    navigation.navigate('home');
  };

  return (
    <View style={style.container}>
      <AppIntroSlider
        keyExtractor={item => item.text}
        renderItem={_renderItem}
        showSkipButton
        showPrevButton
        dotStyle={style.dot}
        activeDotStyle={style.activeDot}
        renderNextButton={() => (
          <Text style={style.sliderNavButtonText}>
            {t('intro_screen_next')}
          </Text>
        )}
        renderDoneButton={() => (
          <Text style={style.sliderNavButtonText}>
            {t('intro_screen_done')}
          </Text>
        )}
        renderPrevButton={() => (
          <Text style={style.sliderNavButtonText}>
            {t('intro_screen_back')}
          </Text>
        )}
        renderSkipButton={() => (
          <Text style={style.sliderNavButtonText}>
            {t('intro_screen_skip')}
          </Text>
        )}
        onDone={_onDone}
        data={data}
      />
    </View>
  );
};

export default IntroScreen;
