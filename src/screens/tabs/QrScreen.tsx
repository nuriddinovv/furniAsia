import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import * as Progress from 'react-native-progress';
import { t } from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserContext } from '../../utils/UserContext';
import { CashbackUser } from '../../api/get';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { color } from '../../../color';
import { QRCodeData } from '../../../interface';

export default function QrScreen() {
  const { userData, setUserData, sessionId } = useUserContext();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phoneNum, setPhoneNum] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData>({
    cardCode: userData?.cardCode,
    cardName: userData?.cardName,
    currentCashback: userData?.currentCashback,
    timeStamp: new Date().toISOString().replace('T', ' ').replace('Z', ''),
  });

  useEffect(() => {
    const getNumber = async () => {
      const number = await AsyncStorage.getItem('phoneNumber');
      setPhoneNum(number);
    };
    getNumber();
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await CashbackUser({ phoneNumber: phoneNum, sessionId });
      if (result.status === 'success' && !result.data.blocked) {
        const updatedData: QRCodeData = {
          cardCode: result.data?.cardCode,
          cardName: result.data?.cardName,
          currentCashback: result.data?.currentCashback,
          timeStamp: new Date()
            .toISOString()
            .replace('T', ' ')
            .replace('Z', ''),
        };
        setQrCodeData(updatedData);
        setUserData(result.data);
      } else if (result.error) {
        Alert.alert(t('cart.error'), result.error.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    } finally {
      setLoading(false);
    }
  }, [phoneNum, sessionId, setUserData]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let resetInterval: NodeJS.Timeout;

    const startNewProgress = () => {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const updated = prev + 0.02;
          return updated >= 1 ? 1 : updated;
        });
      }, 600);
    };

    startNewProgress();

    resetInterval = setInterval(() => {
      clearInterval(progressInterval);
      startNewProgress();
      fetchUserData();
    }, 30000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(resetInterval);
    };
  }, [fetchUserData]);

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.qrCode}>
          {!loading ? (
            qrCodeData?.cardCode ? (
              <QRCode size={250} value={JSON.stringify(qrCodeData)} />
            ) : (
              <Text style={styles.fallbackText}>{t('qrCode.noData')}</Text>
            )
          ) : (
            <View style={styles.loaderWrapper}>
              <ActivityIndicator size="large" color={color.primary} />
            </View>
          )}
        </View>
        <View style={styles.progress}>
          <Progress.Bar
            progress={progress}
            width={250}
            color={color.darkGray}
            unfilledColor={color.gray}
            borderWidth={0}
            height={8}
            animated={true}
            useNativeDriver={true}
          />
        </View>
        <Text style={styles.text}>{t('qrCode.text1')}</Text>
      </View>

      <View style={styles.box}>
        <Text style={[styles.boxText]}>
          {userData?.currentCashback?.toLocaleString?.() || 0} UZS
        </Text>
        <View style={styles.flash}>
          <Ionicons name="flash-sharp" color="gold" size={92} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'space-between',
  },
  qrCode: {
    marginHorizontal: 'auto',
    paddingTop: 144,
  },
  loaderWrapper: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    width: 250,
    height: 250,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: color.darkGray,
  },
  progress: {
    alignItems: 'center',
    marginVertical: 24,
  },
  text: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '900',
    color: 'black',
  },
  box: {
    backgroundColor: color.primary,
    borderBottomRightRadius: 999,
    borderTopLeftRadius: 999,
    height: 100,
    marginHorizontal: 'auto',
    width: 350,
    justifyContent: 'center',
    marginBottom: 20,
  },
  boxText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginLeft: 30,
  },
  flash: {
    position: 'absolute',
    right: 5,
    top: -25,
  },
});
