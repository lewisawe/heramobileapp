import {useCallback, useEffect, useState} from 'react';
import {color, icons, styles} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
  Linking,
  SafeAreaView,
} from 'react-native';
import MapView from 'react-native-maps';
import {Marker, Callout} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import {regionGeolocation} from '../../store/constants';
import {LoadingModal} from '../../components/LoadingModal';

export const NearbyHealthCentersScreen = ({navigation}) => {
  const {t} = useTranslation();

  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState(regionGeolocation);
  const [showCurrentLocationMarker, setShowCurrentLocationMarker] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const getHealthCenters = useCallback(async () => {
    console.log('fdf');
    setLoading(true);
    try {
      const {data} = await axios.get('/health_centers');
      setMarkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const showToast = useCallback(() => {
    Toast.show({
      type: 'error',
      text2: t('location_error_message_text'),
    });
  }, [t]);

  useEffect(() => {
    getHealthCenters();
  }, [getHealthCenters]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        .then(result => {
          switch (result) {
            case RESULTS.UNAVAILABLE:
              console.log(
                'This feature is not available (on this device / in this context)',
              );
              break;
            case RESULTS.DENIED:
              console.log(
                'The permission has not been requested / is denied but requestable',
              );
              request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then(
                requestResult => {
                  if (requestResult === RESULTS.GRANTED) {
                    console.log('The permission is granted by user');
                    Geolocation.getCurrentPosition(info => {
                      setRegion({
                        latitude: info.coords.latitude,
                        longitude: info.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      });
                    });
                    setShowCurrentLocationMarker(true);
                  } else {
                    showToast();
                  }
                },
              );
              break;
            case RESULTS.LIMITED:
              console.log(
                'The permission is limited: some actions are possible',
              );
              break;
            case RESULTS.GRANTED:
              console.log('The permission is granted1');
              Geolocation.getCurrentPosition(info => {
                setRegion({
                  latitude: info.coords.latitude,
                  longitude: info.coords.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              });
              setShowCurrentLocationMarker(true);
              break;
            case RESULTS.BLOCKED:
              console.log(
                'The permission is denied and not requestable anymore',
              );
              break;
          }
        })
        .catch(error => {
          console.error(error);
        });
    } else if (Platform.OS === 'android') {
      check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(permission => {
          switch (permission) {
            case RESULTS.UNAVAILABLE:
              console.log(
                'This feature is not available (on this device / in this context)',
              );
              break;
            case RESULTS.DENIED:
              console.log(
                'The permission has not been requested / is denied but requestable',
              );
              request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(result => {
                if (result === RESULTS.GRANTED) {
                  console.log('The permission is granted by user');
                  Geolocation.getCurrentPosition(info => {
                    setRegion({
                      latitude: info.coords.latitude,
                      longitude: info.coords.longitude,
                      latitudeDelta: 0.05,
                      longitudeDelta: 0.05,
                    });
                  });
                  setShowCurrentLocationMarker(true);
                } else {
                  showToast();
                }
              });
              break;
            case RESULTS.LIMITED:
              console.log(
                'The permission is limited: some actions are possible',
              );
              break;
            case RESULTS.GRANTED:
              console.log('The permission is granted');
              Geolocation.getCurrentPosition(info => {
                setRegion({
                  latitude: info.coords.latitude,
                  longitude: info.coords.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              });
              setShowCurrentLocationMarker(true);
              break;
            case RESULTS.BLOCKED:
              console.log(
                'The permission is denied and not requestable anymore',
              );
              break;
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [showToast]);

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('nearby_health_centers_screen_toolbar_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <View style={[styles.CONTAINER]}>
        <MapView style={style.map} region={region}>
          {markers.map((marker, index) => {
            const lat = +marker.geolocation.split(',')[0];
            const lng = +marker.geolocation.split(',')[1];
            return (
              <Marker
                key={marker.geolocation}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                title={marker.name}>
                <Callout
                  tooltip={true}
                  onPress={() => {
                    const scheme = Platform.select({
                      ios: 'maps:0,0?q=',
                      android: 'geo:0,0?q=',
                    });
                    const latLng = `${lat},${lng}`;
                    const label = `${marker.name}`;
                    const url = Platform.select({
                      ios: `${scheme}${label}@${latLng}`,
                      android: `${scheme}${latLng}(${label})`,
                    });
                    Linking.openURL(url);
                  }}>
                  <View style={style.mapMarkerPopup}>
                    <Text style={styles.mapMarkerTitle} numberOfLines={1}>
                      {marker.name}
                    </Text>
                    <Text style={style.mapMarkerAddress} numberOfLines={1}>
                      {marker.address}
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
          {showCurrentLocationMarker && (
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title={t('current_location_text')}>
              <Image
                source={icons.currentlocation}
                style={{height: 35, width: 35}}
              />
            </Marker>
          )}
        </MapView>
      </View>
      {loading && <LoadingModal />}
      <Toast position="bottom" text2NumberOfLines={2} />
    </View>
  );
};

const style = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('window').height,
  },
  mapMarkerPopup: {
    backgroundColor: color.white,
    padding: 8,
    borderRadius: 8,
    width: 200,
    height: 70,
  },
  mapMarkerTitle: {
    fontWeight: 'bold',
  },
  mapMarkerAddress: {
    fontWeight: '500',
    marginTop: 8,
    color: '#828282',
  },
});
