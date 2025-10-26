import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Toast from 'react-native-toast-message';
import { t } from 'i18next';

import { useUserContext } from '../../utils/UserContext';
import { replace } from '../../utils/NavigationService';
import { color } from '../../../color';

export default function LockScreen() {
  const { clearAllData } = useUserContext();

  const [isSettingNewPin, setIsSettingNewPin] = useState(false);
  const [storagePin, setStoragePin] = useState('');
  const [code, setCode] = useState<string[]>([]);
  const [justSetPin, setJustSetPin] = useState(false); // yangi PINdan keyin auto-FaceID bo‘lmasin

  const codeLength = Array(4).fill(0);

  // PIN ni storage'dan olish
  useEffect(() => {
    (async () => {
      try {
        const pinCode = await AsyncStorage.getItem('PIN');
        if (!pinCode) {
          setIsSettingNewPin(true);
        } else {
          setStoragePin(pinCode);
        }
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: t('PIN.errorLoad') || 'Error while loading PIN',
          text2: String((e as any)?.message || e),
          topOffset: 60,
        });
        // PIN yuklanmasa ham foydalanuvchini kiritishga ruxsat beramiz
        setIsSettingNewPin(true);
      }
    })();
  }, []);
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const number = await AsyncStorage.getItem('phoneNumber');
      if (number) {
        return;
      } else {
        clearAllData();
        replace('login');
      }
    };
    fetchPhoneNumber();
  }, []);

  // Biometrik auth
  const handleFaceID = useCallback(async () => {
    if (isSettingNewPin) return;

    const rnBiometrics = new ReactNativeBiometrics();
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      if (!available || !biometryType) {
        return; // sensor yo‘q yoki biometrika ishlamaydi
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate with biometrics',
      });

      if (success) {
        replace('tab');
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Biometrics error',
        text2: String((e as any)?.message || e),
        topOffset: 60,
      });
    }
  }, [isSettingNewPin]);

  // 4 ta raqam to‘liq kiritilganda tekshirish
  useEffect(() => {
    if (code.length === 4) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const showToast = () => {
    Toast.show({
      type: 'error',
      text1: t('PIN.errorCode') || 'Incorrect PIN',
      text2: t('PIN.errorText') || 'Please try again',
      text1Style: { fontSize: 18, fontWeight: 'bold', color: color.primary },
      text2Style: { fontSize: 14, color: color.darkGray },
      topOffset: 60,
    });
  };

  const handleSubmit = async () => {
    const enteredPin = code.join('');

    // 4 ta kiritilgan bo‘lishi shart — himoya
    if (enteredPin.length !== 4) return;

    if (isSettingNewPin) {
      try {
        await AsyncStorage.setItem('PIN', enteredPin);
        setStoragePin(enteredPin);
        setIsSettingNewPin(false);
        setJustSetPin(true); // shu sessiyada auto-FaceID yo‘q
        setCode([]);
      } catch (e) {
        Toast.show({
          type: 'error',
          text1: 'Failed to save PIN',
          topOffset: 60,
        });
      }
    } else {
      if (enteredPin === storagePin) {
        setCode([]);
        replace('tab');
      } else {
        showToast();
        setCode([]);
      }
    }
  };

  const handleNumberPress = (number: string) => {
    if (code.length < 4) {
      setCode(prev => [...prev, number]);
    }
  };

  const handleDelete = () => {
    if (code.length > 0) {
      setCode(prev => prev.slice(0, -1));
    }
  };

  const handleExit = async () => {
    try {
      await clearAllData();
      replace('login');
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('PIN.exitError') || 'Failed to clear data',
        text2: String((e as any)?.message || e),
        topOffset: 60,
      });
    }
  };

  // App ochilganda (yangi PIN qo‘ymagan bo‘lsak) biometrikani taklif qilish
  useEffect(() => {
    if (!isSettingNewPin && storagePin && !justSetPin) {
      // ixtiyoriy: ozgina kechiktirish UI yonishi uchun
      const timer = setTimeout(() => {
        handleFaceID();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isSettingNewPin, storagePin, justSetPin, handleFaceID]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Text style={styles.greeting}>
        {isSettingNewPin ? t('PIN.newPin') : t('PIN.setPin')}
      </Text>

      <View style={styles.codeView}>
        {codeLength.map((_, index) => (
          <View
            key={index}
            style={[
              styles.codeEmpty,
              { backgroundColor: code[index] ? color.primary : color.gray },
            ]}
          />
        ))}
      </View>

      <View style={styles.numbersView}>
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <TouchableOpacity
              key={number}
              onPress={() => handleNumberPress(number.toString())}
              activeOpacity={0.7}
              style={styles.numberButton}
            >
              <Text style={styles.numberText}>{number}</Text>
            </TouchableOpacity>
          ))}

          {/* FaceID / TouchID */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFaceID}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="fingerprint" size={24} color="white" />
          </TouchableOpacity>

          {/* 0 */}
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleNumberPress('0')}
            activeOpacity={0.7}
          >
            <Text style={styles.numberText}>0</Text>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            style={styles.actionButton}
          >
            <FontAwesome5 name="backspace" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ bottom: -80 }}>
        <TouchableOpacity onPress={handleExit}>
          <Text style={styles.exitText}>{t('PIN.exit') || 'Exit'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 80,
    alignSelf: 'center',
  },
  codeView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginVertical: 80,
  },
  codeEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  numbersView: {
    marginHorizontal: 50,
    gap: 60,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  numberText: {
    fontSize: 24,
    color: 'black',
  },
  numberButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: color.gray,
  },
  actionButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: color.primary,
  },
  exitText: {
    fontSize: 24,
    fontWeight: '700', // iOS: string bo‘lishi kerak
    textAlign: 'center',
    color: color.primary,
  },
});
