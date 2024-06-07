import {useState, useEffect, useCallback, useMemo} from 'react';
import {color, styles} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {CalendarList} from 'react-native-calendars';
import {baseURL} from '../../store/constants';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';
import {formatWithOptions} from 'date-fns/fp';

import {enableModal} from '../../../store/actions/modal';

import {TabsNavigator} from '../../components/tabs-navigator';
import {LoadingModal} from '../../components/LoadingModal';
import {languageSwitcher} from '../../../utils/helpers';
import {load, loadString, save} from '../../../utils/storage';

import {MarkAsDoneBody, NoAppointments} from './components';

import {getEventKey} from '../../utils/helpers';

import style from './style';
import {getVaccines} from '../../api/vaccines';

export const MyAppointmentsScreen = ({navigation}) => {
  const currentDate = navigation.state.params
    ? navigation.state.params.date
    : null;

  const {t} = useTranslation();
  const dispatch = useDispatch();

  const d = new Date();
  const todayString =
    currentDate !== null
      ? currentDate
      : d.getFullYear() +
        '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + d.getDate()).slice(-2);
  const markedDatesObj = useMemo(
    () => ({
      [todayString]: {selected: true, selectedColor: color.primary},
    }),
    [todayString],
  );

  const [markedDates, setMarkedDates] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vaccines, setVaccines] = useState([]);

  const getVaccinesList = useCallback(
    async authToken => {
      try {
        const data = await getVaccines(authToken);
        return setVaccines(data);
      } catch (e) {
        console.error(e);
      }
    },
    [setVaccines],
  );

  const [currentYear, currentMonth] = useMemo(
    () => todayString.split('-'),
    [todayString],
  );

  useEffect(() => {
    const asyncData = async () => {
      const [loadLanguage, authToken] = await Promise.all([
        loadString('language'),
        loadString('token'),
      ]);
      setLanguage(loadLanguage);
      getVaccinesList(authToken);
    };
    asyncData();
  }, [getVaccinesList]);

  const getAppointments = useCallback(
    (authToken, isRefresh) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token ' + authToken,
        },
      };
      fetch(baseURL + '/calendar_events/', requestOptions)
        .then(response => {
          if (isRefresh) {
            setRefreshing(false);
          } else {
            setLoading(false);
          }
          return response.json();
        })
        .then(data => {
          for (let i = 0; i < data.length; i++) {
            const appt = String(data[i].date);
            markedDatesObj[appt] = {
              marked: true,
              dotColor: color.primary,
              customStyles: {
                text: {
                  fontWeight: 'bold',
                },
              },
            };
          }
          markDates(data);
          setAppointments(data);
          save('my_appointments_response', data);
          save('my_appointments_need_refetch', false);
        });
    },
    [markDates, markedDatesObj],
  );

  const callAPI = useCallback(
    isRefresh => {
      loadString('token').then(authToken => {
        getAppointments(authToken, isRefresh);
      });
    },
    [getAppointments],
  );

  const markDates = useCallback(
    data => {
      for (let i = 0; i < data.length; i++) {
        const appt = String(data[i].date);
        markedDatesObj[appt] = {
          marked: true,
          dotColor: color.primary,
          customStyles: {
            text: {
              fontWeight: 'bold',
            },
          },
        };
      }
      setMarkedDates(markedDatesObj);
    },
    [markedDatesObj],
  );

  useEffect(() => {
    load('my_appointments_response').then(data => {
      if (data !== null) {
        load('my_appointments_need_refetch').then(refetch => {
          if (refetch === true) {
            callAPI();
          } else {
            markDates(data);
            setAppointments(data);
          }
        });
      } else {
        callAPI();
      }
    });
  }, [callAPI, markDates]);

  const renderAppointments = () => {
    const hasAppointment = !!appointments.find(a => a.date === selectedDate);
    if (!hasAppointment) {
      if (selectedDate === todayString) {
        return (
          <View style={{padding: 16}}>
            <View style={{flex: 1, flexDirection: 'row', marginBottom: 24}}>
              <Text style={(styles.TEXT, {fontSize: 16})}>
                {t('my_appointments_screen_description_1')}
              </Text>
            </View>
          </View>
        );
      }
      if (language === 'English') {
        return (
          <View style={{padding: 16}}>
            <View style={{flex: 1, flexDirection: 'row', marginBottom: 24}}>
              <Text style={(styles.TEXT, {fontSize: 16})}>
                {t('my_appointments_screen_description_2')}{' '}
                {selectedDate.split('-').reverse().join('-')}
              </Text>
            </View>
          </View>
        );
      }
      if (language === 'Arabic') {
        return (
          <View style={{padding: 16}}>
            <View style={{flex: 1, flexDirection: 'row', marginBottom: 24}}>
              <Text style={(styles.TEXT, {fontSize: 16})}>
                {selectedDate.split('-').reverse().join('-')}{' '}
                {t('my_appointments_screen_description_2')}{' '}
              </Text>
            </View>
          </View>
        );
      }
      if (language === 'Turkish') {
        return (
          <View style={{padding: 16}}>
            <View style={{flex: 1, flexDirection: 'row', marginBottom: 24}}>
              <Text style={(styles.TEXT, {fontSize: 16})}>
                {selectedDate.split('-').reverse().join('-')}{' '}
                {t('my_appointments_screen_description_2')}{' '}
              </Text>
            </View>
          </View>
        );
      }
    }

    return (
      <View style={{padding: 16}}>
        {appointments
          .filter(
            value =>
              value.date === selectedDate && value.event_type === 'vaccination',
          )
          .map(appointment => (
            <View
              key={`appointment-${appointment.person_name}-${
                appointment.date
              }-${Math.random() * 1024}`}
              style={{marginBottom: 24}}>
              <Text style={[styles.TEXT, {fontSize: 16, fontWeight: '700'}]}>
                {appointment.person_name}
              </Text>
              <Text style={[styles.TEXT, {fontSize: 16, marginTop: 4}]}>
                {t('my_appointments_screen_child_description')}{' '}
                {appointment.vaccine_names.join(', ')}
              </Text>
            </View>
          ))}
        {appointments
          .filter(
            value =>
              value.date === selectedDate &&
              value.event_type === 'prenatal_checkup',
          )
          .map(appointment => (
            <View
              key={`appointment-${appointment.person_name}-${
                appointment.date
              }-${Math.random() * 1024}`}
              style={{marginBottom: 24}}>
              <Text style={[styles.TEXT, {fontSize: 16, fontWeight: '700'}]}>
                {t('my_appointments_screen_mommy_title')}
              </Text>
              <Text style={[styles.TEXT, {fontSize: 16, marginTop: 4}]}>
                {t('my_appointments_screen_mommy_description')}
              </Text>
            </View>
          ))}
      </View>
    );
  };

  const formatedDates = useCallback(
    date => {
      const dateToString = formatWithOptions(
        {locale: languageSwitcher(language)},
        'd MMMM yyyy',
      );
      return dateToString(new Date(date));
    },
    [language],
  );

  const filteredAppointments = useMemo(
    () =>
      appointments.filter(e => {
        const [year, month] = e.date.split('-');
        const checkFirstCase = +month <= +currentMonth && +year > +currentYear;

        const checkSecondCase =
          +month >= +currentMonth && +currentYear <= +year;

        return checkFirstCase || checkSecondCase;
      }),
    [appointments, currentMonth, currentYear],
  );

  return (
    <View style={styles.WHITE_CONTAINER_NO_HORIZONTAL_PADDING}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar
          title={t('my_appointments_screen_toolbar_title')}
          navigation={navigation}
        />
      </SafeAreaView>
      <View
        style={[
          styles.WHITE_CONTAINER,
          {
            paddingVertical: 0,
            paddingHorizontal: 0,
            marginBottom: 10,
          },
        ]}>
        <TabsNavigator
          list={[
            t('my_appointments_screen_list_view'),
            t('my_appointments_screen_calender_view'),
          ]}>
          <View style={style.listContainer}>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => callAPI(true)}
                />
              }>
              {filteredAppointments.length === 0 ? (
                <NoAppointments />
              ) : (
                filteredAppointments.map(e => (
                  <View key={getEventKey(e)} style={style.listItemContainer}>
                    <Text style={style.itemDate}>{formatedDates(e.date)}</Text>

                    <Text style={style.itemEvent}>
                      {e.event_type === 'vaccination'
                        ? e.person_name
                        : t('my_appointments_screen_list_vaccination_mother')}
                    </Text>
                    <View style={style.detailsContainer}>
                      <Text style={style.itemEventTarget}>
                        {e.event_type === 'vaccination'
                          ? `${t(
                              'my_appointments_screen_list_recommended_vaccination',
                            )}: ${e.vaccine_names.join(', ')}`
                          : t('my_appointments_screen_mommy_description')}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            enableModal(true, () => (
                              <MarkAsDoneBody data={e} vaccines={vaccines} />
                            )),
                          );
                        }}
                        style={style.markAsDoneBtn}>
                        <Text
                          style={style.markAsDoneText}
                          type={e.event_type}
                          name={e.person_name}>
                          {t('my_appointments_screen_mark_as_done_btn')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={style.findCentersBtn}>
              {appointments.length === 0 ? (
                <>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('myAddAChild')}
                    style={styles.BUTTON}>
                    <Text style={styles.BUTTON_TEXT}>
                      {t('my_children_screen_add_a_child_button')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('myPregnancy')}
                    style={styles.BUTTON_ALT}>
                    <Text style={styles.BUTTON_TEXT_ALT}>
                      {t('my_pregnancy_screen_toolbar_title')}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('nearbyHealthCenters')}
                  style={styles.BUTTON}>
                  <Text style={styles.BUTTON_TEXT}>
                    {t('my_appointments_find_health_center_button')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => callAPI(true)}
              />
            }>
            <CalendarList
              theme={{
                calendarBackground: color.white,
                monthTextColor: color.primary,
                selectedDayBackgroundColor: color.primary,
                selectedDayTextColor: color.white,
                todayTextColor: color.primary,
                dayTextColor: color.primary,
                textMonthFontWeight: 'bold',
              }}
              dayComponent={({date, state, marking}) => {
                if (date.dateString === todayString) {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDate(date.dateString);
                      }}>
                      <View style={{padding: 4, alignItems: 'center'}}>
                        <View
                          style={{
                            width: 24,
                            backgroundColor: color.primary,
                            borderRadius: 16,
                          }}>
                          <Text
                            style={{
                              textAlign: 'center',
                              color: color.white,
                              fontWeight:
                                marking && marking.marked ? '700' : '300',
                            }}>
                            {date.day}
                          </Text>
                        </View>
                        <View
                          style={{
                            marginTop: 4,
                            width: 6,
                            height: 6,
                            justifyContent: 'center',
                            borderRadius: 60 / 2,
                            backgroundColor: color.primary,
                            opacity: marking && marking.marked ? 1 : 0,
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                } else {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDate(date.dateString);
                      }}>
                      <View style={{padding: 4, alignItems: 'center'}}>
                        <Text
                          style={{
                            textAlign: 'center',
                            color: color.primary,
                            fontWeight:
                              marking && marking.marked ? '700' : '300',
                          }}>
                          {date.day}
                        </Text>
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            justifyContent: 'center',
                            borderRadius: 60 / 2,
                            backgroundColor: color.primary,
                            opacity: marking && marking.marked ? 1 : 0,
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                }
              }}
              allowFontScaling
              current={currentDate}
              markedDates={markedDates}
              horizontal
              pagingEnabled
              // Max amount of months allowed to scroll to the past. Default = 50
              pastScrollRange={50}
              // Max amount of months allowed to scroll to the future. Default = 50
              futureScrollRange={50}
              // Enable or disable scrolling of calendar list
              scrollEnabled
              // Enable or disable vertical scroll indicator. Default = false
              showScrollIndicator
              onDayPress={day => setSelectedDate(day.dateString)}
              markingType="custom"
            />
            {renderAppointments()}
          </ScrollView>
        </TabsNavigator>
      </View>
      {loading && <LoadingModal />}
    </View>
  );
};
