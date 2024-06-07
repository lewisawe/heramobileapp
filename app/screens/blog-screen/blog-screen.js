import {useEffect, useState, createRef} from 'react';
import {styles, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {View, Image, SafeAreaView} from 'react-native';
import WebView from 'react-native-webview';
import {useTranslation} from 'react-i18next';
import {t} from 'i18next';
import Modal from 'react-native-modal';

const languageLinks = {
  en: 'https://heradigitalhealth.org/blog/',
  ar: 'https://heradigitalhealth.org/ar/blog/',
  tr: 'https://heradigitalhealth.org/tr/blog/',
  pus: 'https://heradigitalhealth.org/blog/', //Use the English version
  prs: 'https://heradigitalhealth.org/blog/', //Use the English version
};

export const BlogScreen = ({navigation}) => {
  const {i18n} = useTranslation();

  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState();
  const webView = createRef();

  useEffect(() => {
    const link = languageLinks[i18n.language];
    if (link) {
      setUrl(link);
      setLoading(true);
      webView.current.reload();
    }
    setLoading(false);
  }, [i18n, webView]);

  const jsCode = `
        let headerSelector = document.getElementById('Header_wrapper')
        let footerSelector = document.getElementById('Footer')
        let languagesSelector = document.querySelector('.wpml-ls-statics-footer')
        headerSelector.style.display = "none"
        footerSelector.style.display = "none"
        languagesSelector.style.display = "none"
        true;
        `;

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('health_tips_news_screen_toolbar_title')}
          navigation={navigation}
        />
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
