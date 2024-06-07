import {useEffect} from 'react';
import {Provider} from 'react-redux';
import Navigation from './app/navigation/createNavigator';
import {ONE_SIGNAL_APP_ID, SENTRY_DSN} from '@env';
import configureSagaStore from './app/stores';
import OneSignal from 'react-native-onesignal';
import './i18n.config';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {loadString} from './utils/storage';
import {NativeModules, Platform} from 'react-native';
import {Modal} from './app/components/GlobalModal';
import {Settings} from 'react-native-fbsdk-next';
import {PersistGate} from 'redux-persist/lib/integration/react';
import * as Sentry from '@sentry/react-native';

if (!__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

// Setting the facebook app id using setAppID
Settings.setAppID('830593163868225');
Settings.initializeSDK();

//OneSignal Init Code
/*
OneSignal processing logic:
Step 1: When the app is first installed, opened, and the user allows notifications,
        a new record will be inserted into OneSignal server with a subscription status is set to “check mark” 
        (i.e. the subscription is active), and with the tag: first_time: yes
Step 2: When the user is signed in into the app,
        the previous record (subscription) will be updated with external user id (from our database - user id)
        as well as the tag: first_time will be ‘no’.
Step 3: When the user is signed out from the app, only the external id is removed from the record.
Step 4: When the app is uninstalled, the previous record’s subscription status 
        will be: ‘Not Subscribed’ and the External id will be empty.
Step 5: If the app is reinstalled again,
        then a new record (with a different subscription and OneSignal ids) will be inserted again into OneSignal server,
        with a same description as in Step 1 (Note: in this case the external id will be set also).
*/
OneSignal.setLogLevel(6, 0);
OneSignal.setAppId(ONE_SIGNAL_APP_ID);
OneSignal.getTags(tags => {
  if (!tags) {
    OneSignal.sendTag('first_time', 'yes');
  }
});
//END OneSignal Init Code

//Prompt for push on iOS
OneSignal.promptForPushNotificationsWithUserResponse(response => {
  console.log('Prompt response:', response);
});

//Method for handling notifications received while app in foreground
OneSignal.setNotificationWillShowInForegroundHandler(
  notificationReceivedEvent => {
    console.log(
      'OneSignal: notification will show in foreground:',
      notificationReceivedEvent,
    );
    let notification = notificationReceivedEvent.getNotification();
    console.log('notification: ', notification);
    const data = notification.additionalData;
    console.log('additionalData: ', data);
    // Complete with null means don't show a notification.
    notificationReceivedEvent.complete(notification);
  },
);

//Method for handling notifications opened
OneSignal.setNotificationOpenedHandler(notification => {
  console.log('OneSignal: notification opened:', notification);
});

const {store, persistor} = configureSagaStore();

const App = () => {
  useEffect(() => {
    Settings.setAdvertiserTrackingEnabled(true);
  }, []);

  useEffect(() => {
    loadString('language').then(language => {
      let lng = 'en';
      switch (language) {
        case 'English':
          lng = 'en';
          break;
        case 'Arabic':
          lng = 'ar';
          break;
        case 'Turkish':
          lng = 'tr';
          break;
        case 'Dari':
          lng = 'prs';
          break;
        case 'Pashto':
          lng = 'pus';
          break;
        default:
          const deviceLanguage =
            Platform.OS === 'ios'
              ? NativeModules.SettingsManager.settings.AppleLocale ||
                NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
              : NativeModules.I18nManager.localeIdentifier;

          if (deviceLanguage.startsWith('en')) {
            lng = 'en';
          } else if (deviceLanguage.startsWith('ar')) {
            lng = 'ar';
          } else if (deviceLanguage.startsWith('tr')) {
            lng = 'tr';
          } else if (deviceLanguage.startsWith('prs')) {
            lng = 'prs';
          } else if (deviceLanguage.startsWith('pus')) {
            lng = 'pus';
          }
      }

      i18n.use(initReactI18next).init({
        lng: lng,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Modal />
        <Navigation />
      </PersistGate>
    </Provider>
  );
};

export default App;
