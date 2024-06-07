import {useEffect, useMemo, useState} from 'react';
import {color, styles, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {loadString, save, load} from '../../../utils/storage';
import {baseURL} from '../../store/constants';
import Modal from 'react-native-modal';

export const NotificationsScreen = ({navigation}) => {
  let notificationsFromHome = navigation.state.params
    ? navigation.state.params.notifications
    : null;

  const {t} = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  const getNotifications = authToken => {
    setLoading(true);
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + authToken,
      },
    };
    fetch(baseURL + '/notification_events/', requestOptions)
      .then(response => {
        setLoading(false);
        return response.json();
      })
      .then(data => {
        save('notifications_response', data);
        setNotifications(data);
      });
  };

  const readNotifications = authToken => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + authToken,
      },
      body: null,
    };
    fetch(baseURL + '/notification_events/mark_all_as_read/', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error();
        } else {
          return response.json();
        }
      })
      .then(data => {})
      .catch(e => {});
  };

  useEffect(() => {
    async function getToken() {
      const authToken = await loadString('token');
      load('notifications_response').then(data => {
        if (data !== null) {
          setNotifications(data);
        }
      });
      getNotifications(authToken);
      readNotifications(authToken);
    }
    getToken();

    if (notificationsFromHome !== null) {
      setNotifications(notificationsFromHome);
    }
  }, [navigation, notificationsFromHome]);

  const handleRedirection = item => {
    item.read_at = 'not_null';
    const newArray = notifications;
    setNotifications(newArray);
    setRefresh(!refresh);
    switch (item.destination) {
      case 'calendar':
        navigation.navigate('myAppointments', {date: item.date});
        break;
    }
  };

  const Item = ({item}) => (
    <TouchableOpacity onPress={() => handleRedirection(item)}>
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          paddingVertical: 22,
          paddingHorizontal: 16,
          backgroundColor: 'white',
        }}>
        <Text
          style={
            (styles.TEXT,
            {
              fontSize: 16,
              fontWeight: item.read_at ? '300' : '600',
              color: item.read_at ? color.black : color.primary,
            })
          }>
          {item.push_title}
        </Text>
        <Text
          style={
            (styles.TEXT,
            {
              fontSize: 16,
              fontWeight: item.read_at ? '300' : '600',
              color: item.read_at ? color.black : color.primary,
              marginTop: 8,
            })
          }>
          {item.push_body}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({item}) => {
    return <Item item={item} />;
  };

  const FlatListItemSeparator = useMemo(() => {
    return () => (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: color.background,
        }}
      />
    );
  }, []);

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('notifications_screen_toolbar_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <View style={[styles.CONTAINER_NO_HORIZONTAL_PADDING]}>
        {notifications.length > 0 ? (
          <FlatList
            extraData={refresh}
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={FlatListItemSeparator}
          />
        ) : (
          <Text style={[styles.TEXT, {paddingHorizontal: 16}]}>
            {t('notifications_screen_empty_state_text')}
          </Text>
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
