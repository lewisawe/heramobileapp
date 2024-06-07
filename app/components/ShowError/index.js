import {Image, Text, View} from 'react-native';
import {icons, styles} from '../../theme';

const ShowError = ({errorMessage}) => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image source={icons.error} style={{marginEnd: 8}} />
      <Text style={styles.ERROR_STYLE}>{errorMessage}</Text>
    </View>
  );
};

export default ShowError;
