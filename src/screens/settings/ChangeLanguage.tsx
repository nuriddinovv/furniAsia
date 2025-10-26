import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { color } from '../../../color';

export default function ChangeLanguage() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();

  useEffect(() => {
    navigation.setOptions({
      title: t('setting.editLang'),
      headerShadowVisible: false,
      headerBackTitleVisible: false,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, i18n.language]);

  useEffect(() => {
    const loadLang = async () => {
      const storedLang = await AsyncStorage.getItem('language');
      if (storedLang) {
        i18n.changeLanguage(storedLang);
      }
    };
    loadLang();
  }, []);

  const changeLang = async (lang: string) => {
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.box}
        activeOpacity={0.8}
        onPress={() => changeLang('uz')}
      >
        <View>
          <Text style={styles.shopName}>O'zbekcha</Text>
        </View>
        <View style={styles.iconWrapper}>
          {i18n.language === 'uz' && <View style={styles.icon}></View>}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.box}
        activeOpacity={0.8}
        onPress={() => changeLang('ru')}
      >
        <View>
          <Text style={styles.shopName}>Русский </Text>
        </View>
        <View style={styles.iconWrapper}>
          {i18n.language === 'ru' && <View style={styles.icon}></View>}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.box}
        activeOpacity={0.8}
        onPress={() => changeLang('en')}
      >
        <View>
          <Text style={styles.shopName}>English</Text>
        </View>
        <View style={styles.iconWrapper}>
          {i18n.language === 'en' && <View style={styles.icon}></View>}
        </View>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 8,
  },

  box: {
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginVertical: 8,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: 600,
    color: 'black',
  },
  iconWrapper: {
    borderColor: color.primary,
    borderWidth: 3,
    padding: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  icon: {
    backgroundColor: color.primary,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
});
