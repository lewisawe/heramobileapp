import {Text, Image, TouchableOpacity} from 'react-native';
import {whatsAppIcon} from '../../theme/images';
import styles from './style';
import {t} from 'i18next';
import {YesNoModal} from '../YesNoModal';
import {useDispatch} from 'react-redux';
import {enableModal} from '../../../store/actions/modal';
import {userService} from '../../services/user-service';
import {MessageModal} from '../MessageModal/MessageModal';

export default function WhatsappOptIn({fullPhoneNumber, onConsent}) {
  const dispatch = useDispatch();

  const onOKClickedHandler = async () => {
    try {
      await userService.updateWhatsAppOptStatus(fullPhoneNumber, 'opt_in');
      if (onConsent) {
        onConsent(true);
      }
    } catch (err) {
      dispatch(
        enableModal(true, () => (
          <MessageModal message={t('generic_error_message_text')} />
        )),
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        dispatch(
          enableModal(true, () => (
            <YesNoModal
              message={t('consent_to_receive_whatsapp_notifications')}
              yesTitle={t('your_pregnancy_screen_answer_yes_button')}
              noTitle={t('your_pregnancy_screen_answer_no_button')}
              onOKClicked={() => {
                onOKClickedHandler();
              }}
            />
          )),
        );
      }}
      style={styles.container}>
      <Image style={styles.icon} source={whatsAppIcon} />
      <Text style={styles.alertText}>
        {t('get_healthcare_tips_on_whatsapp_home_screen')}
      </Text>
    </TouchableOpacity>
  );
}
