import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  UIManager,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import {color, styles, gifLoading} from '../../theme';
import {ToolBar} from '../../components/toolbar';
import {userService} from '@services/user-service';
import {useTranslation} from 'react-i18next';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export function SrhrItemDetailsScreen({navigation}) {
  const [article, setArticle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmptySections, setIsEmptySections] = useState(false);
  const {i18n} = useTranslation();

  useEffect(() => {
    async function getArticle() {
      try {
        const response = await userService.getArticle(
          navigation.state.params.id,
          i18n.language,
        );
        if (response.status >= 200 && response.status <= 299) {
          setArticle(response.data);
        } else {
          setIsEmptySections(true);
        }
      } catch (err) {
        setIsEmptySections(true);
      }

      setLoading(false);
    }
    getArticle();
  }, [i18n.language, navigation]);

  return (
    <View style={styles.FULL}>
      <SafeAreaView style={styles.SAFE_AREA_VIEW}>
        <ToolBar title={article.title} navigation={navigation} />
      </SafeAreaView>
      {!loading && !isEmptySections && (
        <ScrollView>
          <View style={styles.CONTAINER}>
            <Text style={localStyles.articleContent}>{article.content}</Text>
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

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  articleContent: {
    textAlign: 'left',
    lineHeight: 24,
    fontSize: 16,
  },
});
