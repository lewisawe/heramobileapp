import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import {color, styles, gifLoading} from '../../theme';
import {useTranslation} from 'react-i18next';
import {t} from 'i18next';
import {ToolBar} from '../../components/toolbar';
import {userService} from '@services/user-service';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export function SrhrScreen({navigation}) {
  const {i18n} = useTranslation();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmptySections, setIsEmptySections] = useState(false);

  useEffect(() => {
    async function getSectionsOfConcept() {
      try {
        const response = await userService.getSectionsOfConcept(
          1,
          i18n.language,
        );
        if (response.status >= 200 && response.status <= 299) {
          setSections(response.data);
        } else {
          setIsEmptySections(true);
        }
      } catch (err) {
        setIsEmptySections(true);
      }

      setLoading(false);
    }

    getSectionsOfConcept();
  }, [i18n.language]);

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar title={t('home_screen_shrh_title')} navigation={navigation} />
      </SafeAreaView>
      {!loading && !isEmptySections && (
        <ScrollView>
          <View style={localStyles.sectionContainer}>
            {sections.length > 0 &&
              sections.map((s, index) => (
                <Section
                  title={s.name}
                  key={s.name + index}
                  items={s.articles}
                  navigation={navigation}
                />
              ))}
          </View>
        </ScrollView>
      )}
      {isEmptySections && (
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
          }}>
          <Text
            style={{
              color: color.disabledtext,
              textAlign: 'center',
            }}>
            No content
          </Text>
        </View>
      )}
      {loading && (
        <View style={{justifyContent: 'center', flex: 1}}>
          <View style={{alignSelf: 'center'}}>
            <Image
              source={gifLoading}
              style={{width: 100, height: 100, borderRadius: 20}}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function Section(props) {
  const [open, setopen] = useState(false);
  const onPress = (value, title) => {
    if (value === 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setopen(!open);
    } else {
      props.navigation.navigate('srhrItemDetailsScreen', {
        id: value,
      });
    }
  };
  return (
    <Pressable
      style={localStyles.section}
      onPress={() => onPress(0)}
      activeOpacity={1}>
      <View style={localStyles.sectionHeaderContainer}>
        <Text style={localStyles.sectionHeaderText}>{props.title}</Text>
        <View style={{flex: 5}} />
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: color.background,
            borderRadius: 13,
            width: 26,
            height: 26,
          }}>
          <Text style={{textAlign: 'center', color: color.black}}>
            {props.items.length}
          </Text>
        </View>
      </View>
      {open && (
        <View>
          {props.items.map((s, index) => (
            <Pressable
              onPress={() => onPress(s.id, s.title)}
              key={s.title + index}>
              <View style={localStyles.itemContainer}>
                <Text style={localStyles.item}>📄</Text>
                <View style={{width: 8}} />
                <Text style={localStyles.item}>{s.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const localStyles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    width: '100%',
    borderWidth: 0,
    overflow: 'hidden',
    marginBottom: 5,
  },
  sectionHeaderText: {
    fontSize: 16,
    color: color.white,
  },
  sectionHeaderContainer: {
    backgroundColor: color.primary,
    margin: 0,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  item: {
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: color.disabled,
    paddingLeft: 8,
    paddingRight: 32,
    paddingVertical: 8,
  },
});
