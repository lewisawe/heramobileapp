import {useEffect, useState, createRef} from 'react';
import {styles, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {View, Image, SafeAreaView} from 'react-native';
import WebView from 'react-native-webview';
import {useAsyncStorage} from '../../../utils/storage';
import {useTranslation} from 'react-i18next';
import Modal from 'react-native-modal';

const languageLinks = {
  English: 'https://heradigitalhealth.org/docs/',
  Arabic: 'https://heradigitalhealth.org/ar/docs/',
  Turkish: 'https://heradigitalhealth.org/tr/docs/',
};

export const ShrhScreen = ({navigation}) => {
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState();
  const language = useAsyncStorage('language');
  const webView = createRef();

  useEffect(() => {
    const link = languageLinks[language];
    if (link) {
      setUrl(link);
      setLoading(true);
      webView.current.reload();
    }
    setLoading(false);
  }, [language, webView]);

  const jsCode = `
        let headerSelector = document.getElementById('Header_wrapper')
        let footerSelector = document.getElementById('Footer')
        let languagesSelector = document.querySelector('.wpml-ls-statics-footer')
        let betterdocsSelector = document.querySelector('.betterdocs-entry-footer')
        let betterdocsCreditSelector = document.querySelector('.betterdocs-credit')
        headerSelector.style.display = "none"
        footerSelector.style.display = "none"
        languagesSelector.style.display = "none"
        betterdocsSelector.style.display = "none"
        betterdocsCreditSelector.style.display = "none"
        true;
        `;

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar title={t('home_screen_shrh_title')} navigation={navigation} />
      </SafeAreaView>
      <View style={[styles.WEBVIEW_CONTAINER]}>
        <WebView
          cacheEnabled={false}
          cacheMode={'LOAD_NO_CACHE'}
          incognito={true}
          renderLoading={() => <View />}
          onLoadEnd={() => setLoading(false)}
          ref={webView}
          injectedJavaScript={jsCode}
          onMessage={() => {}}
          source={{uri: url}}
        />
      </View>
      {loading && (
        <Modal isVisible={true} animationIn="fadeIn" animationOut="fadeOut">
          <View style={{justifyContent: 'center', flex: 1}}>
            <View style={{alignSelf: 'center'}}>
              <Image
                source={gifLoading}
                style={{width: 100, height: 100, borderRadius: 20}}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
