import {Text, View, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default function SignInButton(props) {
  const handler = () => {
    props.onPress();
  };

  return (
    <View
      style={{
        width: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor,
        borderWidth: props.borderWidth,
        borderColor: props.borderColor,
        borderRadius: props.borderRadius,
        alignSelf: 'center',
      }}>
      <TouchableOpacity onPress={() => handler()}>
        <View
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            height: props.height,
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '60%',
              alignItems: 'center',
              flexDirection: 'row',
              height: props.height,
            }}>
            <Image
              style={{
                height: '50%',
                paddingHorizontal: 20,
                resizeMode: 'contain',
              }}
              source={props.icon}
            />
            <Text style={{color: props.textColor}}>{props.title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
