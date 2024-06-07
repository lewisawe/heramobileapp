import {useEffect, useMemo, useState} from 'react';
import {styles, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {View, Image, SafeAreaView} from 'react-native';
import WebView from 'react-native-webview';
import {useAsyncStorage} from '../../../utils/storage';
import {useTranslation} from 'react-i18next';
import Modal from 'react-native-modal';

const languageLinks = {
  English: 'https://heradigitalhealth.org/privacy-policy/',
  Arabic: 'https://heradigitalhealth.org/ar/privacy-policy/',
  Turkish: 'https://heradigitalhealth.org/tr/gizlilik-politikasi/',
};

export const PrivacyPolicyScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState();

  const language = useAsyncStorage('language');

  useEffect(() => {
    const link = languageLinks[language];

    if (link) {
      setUrl(link);
      setLoading(true);
    }
  }, [language]);

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
          title={t('privacy_policy_toolbar_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <View style={[styles.WEBVIEW_CONTAINER]}>
        {useMemo(
          () => (
            <WebView
              renderLoading={() => <View />}
              onLoadEnd={() => setLoading(false)}
              injectedJavaScript={jsCode}
              onMessage={() => {}}
              source={{uri: url}}
            />
          ),
          [jsCode, url],
        )}
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
