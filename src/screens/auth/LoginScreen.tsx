import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  SafeAreaView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  InputAccessoryView,
} from 'react-native';
import { useUserContext } from '../../utils/UserContext';
import useFetch from '../../api/useFetch';
import { SessionIdApi } from '../../api/post';
import { CashbackUser } from '../../api/get';
import { replace } from '../../utils/NavigationService';
import { t } from 'i18next';
import { UserResponse } from '../../../interface';
import { color } from '../../../color';

export default function LoginScreen() {
  const { setSessionId, sessionId, setUserData } = useUserContext();
  const [number, setNumber] = useState('');
  const accessoryID = 'login_accessory';

  const {
    data: sessionIdData,
    loading: sessionIdLoading,
    error: sessionIdError,
  } = useFetch(async () => await SessionIdApi());

  useEffect(() => {
    if (sessionIdData && sessionIdData.data?.sessionId) {
      setSessionId(sessionIdData.data.sessionId);
    } else if (!sessionIdLoading && sessionIdError) {
      Alert.alert(String(t('cart.error')), String(sessionIdError.message));
    }
  }, [sessionIdData, sessionIdLoading, sessionIdError]);

  const {
    data: CashbackUserData,
    loading: CashbackUserLoading,
    error: CashbackUserError,
    refetch: fetchCashbackUser,
  } = useFetch<UserResponse>(async () => {
    return await CashbackUser({ phoneNumber: number, sessionId });
  }, false);

  useEffect(() => {
    if (
      CashbackUserData?.status === 'success' &&
      !CashbackUserData.data.blocked
    ) {
      setUserData(CashbackUserData.data);
      replace('verification');
    } else if (
      CashbackUserData?.status === 'success' &&
      CashbackUserData.data.blocked
    ) {
      Alert.alert(t('login.errAlertH'), t('login.errAlertB1'));
    } else if (
      CashbackUserData?.status === 'error' &&
      (CashbackUserData.error?.code === '-1' ||
        CashbackUserData.error?.code === '-100')
    ) {
      Alert.alert(t('login.errAlertH'), t('login.errAlertB2'));
    }
  }, [CashbackUserData]);

  const handleLogin = async () => {
    Keyboard.dismiss(); // OK bosilganda yoki submit bo'lganda yopamiz
    await fetchCashbackUser();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1) “Login” tugmasi klaviaturadan tepaga ko‘tarilishi uchun */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerText1}>{t('login.headertxt1')}</Text>
          <Text style={styles.headerText2}>{t('login.headertxt2')}</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.phoneInputWrapper}>
            <Text style={styles.countryCode}>+998</Text>
            <TextInput
              placeholderTextColor={'gray'}
              value={number}
              onChangeText={setNumber}
              style={styles.phoneInput}
              placeholder="XX XXX XX XX"
              keyboardType="number-pad" // number-pad/phone-pad return tugmasiz bo'lishi mumkin
              returnKeyType="done" // mavjud bo'lsa “OK/Done” chiqaradi
              blurOnSubmit
              onSubmitEditing={handleLogin} // “OK” bosilganda ishlaydi
              maxLength={9}
              // iOS: accessory bar id
              inputAccessoryViewID={
                Platform.OS === 'ios' ? accessoryID : undefined
              }
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogin}
            style={styles.button}
          >
            {CashbackUserLoading ? (
              <ActivityIndicator
                style={{ paddingHorizontal: 35, paddingVertical: 2 }}
                size="small"
                color="white"
              />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: '800', color: 'white' }}>
                {t('login.btn')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* 2) iOS: raqamli klaviaturada Return tugmasi bo‘lmaganda “OK” qo‘shamiz */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={accessoryID}>
          <View style={styles.accessoryBar}>
            <TouchableOpacity
              style={styles.keyBtn}
              onPress={() => setNumber(p => p + ',')}
            >
              <Text style={{ fontSize: 20 }}>,</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keyBtn} onPress={handleLogin}>
              <Text style={{ fontSize: 16, fontWeight: '700' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerText1: { color: 'black', fontSize: 36, fontWeight: '800' },
  headerText2: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 20,
  },
  inputContainer: {
    flex: 1,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.gray,
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 56,
  },
  countryCode: {
    fontSize: 20,
    paddingRight: 3,
    color: 'black',
  },
  phoneInput: {
    minWidth: 128,
    fontSize: 20,
    color: 'black',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    width: '48%',
    height: 60,
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  // iOS accessory bar
  accessoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  keyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'white',
    borderRadius: 10,
  },
});
