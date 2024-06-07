import {Image, Text, View} from 'react-native';
import {icons, styles} from '../../theme';

function GenericErrorMessage({message}) {
  return (
    <>
      {message !== '' && (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={icons.error} style={{marginEnd: 8}} />
          <Text style={styles.ERROR_STYLE}>{message}</Text>
        </View>
      )}
    </>
  );
}

export default GenericErrorMessage;
