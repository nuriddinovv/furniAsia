import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../utils/UserContext';
import useFetch from '../../api/useFetch';
import { UpdateData } from '../../api/post';
import { replace } from '../../utils/NavigationService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserResponse } from '../../../interface';
import { color } from '../../../color';

export default function ChangeProfile() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const { userData, sessionId, setUserData } = useUserContext();
  const [changeName, setChangeName] = useState(userData?.cardName || '');
  const [changePhone, setChangePhone] = useState(userData?.phone || '');
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    navigation.setOptions({
      title: t('setting.editProfile'),
      headerShadowVisible: false,
      titleAlign: 'center',
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

  const {
    data,
    loading,

    refetch: updateUserData,
  } = useFetch<UserResponse>(async () => {
    if (userData) {
      return await UpdateData({
        cardCode: userData?.cardCode,
        cardName: changeName,
        phone: changePhone,
        sessionId: sessionId,
      });
    }
  }, false);

  useEffect(() => {
    if (data) {
      if (data.status === 'success') {
        setUserData(data.data);
        if (changePhone !== userData?.phone) {
          // Only clear auth-related data instead of everything
          AsyncStorage.clear();
          replace('LoginScreen');
        } else if (changeName !== userData?.cardName) {
          setUserData(data.data);
          Toast.show({
            type: 'success',
            text1: t('setting.success'),
            text2: t('setting.successText'),
            text1Style: { fontSize: 18, fontWeight: 'bold', color: 'green' },
            topOffset: 60,
          });
        }
      } else if (data.error) {
        Alert.alert(t('cart.error'), data.error.message);
      }
    }
  }, [data, updateUserData]);

  const handleSubmit = () => {
    if (changeName !== userData?.cardName || changePhone !== userData?.phone) {
      updateUserData();
    } else {
      Toast.show({
        type: 'error',
        text1: t('cart.error'),
        text2: t('setting.errAlertB2'),
        text1Style: { fontSize: 18, fontWeight: 'bold', color: color.primary },
        topOffset: 60,
      });

      return;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 16,
          justifyContent: 'space-between',
        }}
      >
        <View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('setting.changeName')}</Text>
            <TextInput
              value={changeName}
              onChangeText={setChangeName}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('setting.changeNumber')}</Text>
            <TextInput
              keyboardType="phone-pad"
              value={changePhone}
              onChangeText={setChangePhone}
              style={styles.input}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size={'small'} color={'white'} />
          ) : (
            <Text style={styles.buttonText}>{t('setting.btn')}</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 500,
    marginBottom: 10,
    color: 'black',
  },
  input: {
    borderRadius: 20,
    textAlign: 'center',
    backgroundColor: color.gray,
    padding: 12,
    fontSize: 16,
    color: 'black',
  },
  button: {
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: color.primary,
    alignItems: 'center',
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
