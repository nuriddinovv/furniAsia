import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../utils/UserContext';
import { UpdateData, VerificationCode } from '../../api/post';
import useFetch from '../../api/useFetch';
import { replace } from '../../utils/NavigationService';
import { VerificationResponse } from '../../../interface';
import { color } from '../../../color';

export default function VerificationScreen() {
  const { userData, sessionId, setUserData } = useUserContext();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [name, setName] = useState(userData?.cardName || '');
  const [nameInputVisible, setNameInputVisible] = useState(false);

  const { data, loading, error } = useFetch<VerificationResponse>(async () => {
    return await VerificationCode({
      sessionId: sessionId,
      phoneNumber: userData?.phone || '',
    });
  });

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];

    // If user pastes full code
    if (text.length === 6) {
      const chars = text.split('').slice(0, 6);
      setOtp(chars);
      inputRefs.current[5]?.focus();
      return;
    }

    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const code = otp.join('');

  const handleVerification = () => {
    if (name && Number(data?.data.otpCode) === Number(code)) {
      AsyncStorage.setItem(
        'phoneNumber',
        userData?.phone?.replace(/^(\+998)/, '') || '',
      );
      setCardName();
      replace('lock');
    } else {
      Alert.alert(t('Verification.errAlertH'), t('Verification.errAlertB1'));
    }
  };

  const setCardName = async () => {
    if (userData) {
      const result = await UpdateData({
        cardName: name,
        cardCode: userData?.cardCode,
        phone: userData?.phone,
        sessionId: sessionId,
      });
      if (result.status === 'success') {
        setUserData(result.data);
      } else {
        Alert.alert(
          t('Verification.errAlertH'),
          `${t('Verification.errAlertB1')}: ${result.error.message}`,
        );
      }
    }
  };

  useEffect(() => {
    if (userData?.cardName === null) {
      setNameInputVisible(true);
    }
  }, [userData]);

  useEffect(() => {
    const joined = otp.join('');
    if (joined.length === 6) {
      handleVerification();
    }
  }, [otp]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('Verification.headertxt1')}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.otpRow}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              value={value}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {/* Name input (optional) */}
        {nameInputVisible && (
          <View style={styles.inputWrapper}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder={t('Verification.placeHolder1')}
              placeholderTextColor={'gray'}
              keyboardType="default"
            />
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleVerification}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{t('login.btn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    fontSize: 20,
    backgroundColor: '#f3f4f6',
    color: 'black',
  },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 28,
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    fontSize: 20,
    color: 'black',
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button: {
    width: '48%',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: color.primary,
    marginBottom: 40,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
