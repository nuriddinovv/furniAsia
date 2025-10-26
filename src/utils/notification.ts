// notifications.ts

import { Platform, PermissionsAndroid } from 'react-native';
import messaging, {
  FirebaseMessagingTypes,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { addNotification, markRead } from './notificationStore';
import { navigate } from './NavigationService';

export const requestAndroidPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const requestIosPermission = async (): Promise<boolean> => {
  const status = await messaging().requestPermission();
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
};

export const getFcmToken = async (): Promise<string | null> => {
  const androidOk = await requestAndroidPermission();
  const iosOk = Platform.OS === 'ios' ? await requestIosPermission() : true;
  if (!(androidOk && iosOk)) return null;

  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    return token;
  } catch (e) {
    console.error('❌ Token olishda xatolik:', e);
    return null;
  }
};

export const setupForegroundListener = () => {
  const unsubscribe = messaging().onMessage(
    async (msg: FirebaseMessagingTypes.RemoteMessage) => {
      const title = msg.notification?.title || '🔔 Yangi xabar';
      const body = msg.notification?.body || '';
      const saved = await addNotification(title, body);
      Toast.show({
        type: 'info',
        text1: title,
        text2: body,
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
    },
  );

  return unsubscribe;
};

export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(
    async (msg: FirebaseMessagingTypes.RemoteMessage) => {
      const title = msg.notification?.title || '🔔 Yangi xabar';
      const body = msg.notification?.body || '';
      await addNotification(title, body);
    },
  );
  messaging().onNotificationOpenedApp(async msg => {
    const title = msg.notification?.title || '🔔 Yangi xabar';
    const body = msg.notification?.body || '';
    const saved = await addNotification(title, body);
    await markRead(saved.id, true);
  });
};

export const checkInitialNotification = async () => {
  const msg = await messaging().getInitialNotification();
  if (msg) {
    const title = msg.notification?.title || '🔔 Yangi xabar';
    const body = msg.notification?.body || '';
    const saved = await addNotification(title, body);

    await markRead(saved.id, true);
  }
};
