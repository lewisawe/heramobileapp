import {useEffect, useState, createRef} from 'react';
import {View, Image, Modal, SafeAreaView} from 'react-native';
import {styles, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {useTranslation} from 'react-i18next';
import {t} from 'i18next';
import WebView from 'react-native-webview';

const languageLinks = {
  en: 'https://docs.google.com/forms/d/e/1FAIpQLSdvwmzhdbSAou_8FDfz2u0HcN5lLgRzsbiyDT-XVRmDA-OkgA/viewform',
  ar: 'https://docs.google.com/forms/d/e/1FAIpQLSei-62xMiItmzJTH3D_okOBeUoGUem_Su0be2TyKkg3wNzxnw/viewform',
  tr: 'https://docs.google.com/forms/d/e/1FAIpQLSc91CkLspBAzH0wgZDC3ZuE9boGCMLE-GM0rIcqitiBEyo1Qg/viewform',
  prs: 'https://docs.google.com/forms/d/e/1FAIpQLSdvwmzhdbSAou_8FDfz2u0HcN5lLgRzsbiyDT-XVRmDA-OkgA/viewform', //using the English version
  pus: 'https://docs.google.com/forms/d/e/1FAIpQLSdvwmzhdbSAou_8FDfz2u0HcN5lLgRzsbiyDT-XVRmDA-OkgA/viewform', //using the English version
};

export const FeedbackScreen = ({navigation}) => {
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

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('feedback_screen_toolbar_title')}
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
