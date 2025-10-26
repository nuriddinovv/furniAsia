import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  BackHandler,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import Accordion from 'react-native-collapsible/Accordion';
import useFetch from '../../api/useFetch';
import { CashbackUser, News, TopItems } from '../../api/get';
import { navigate, replace } from '../../utils/NavigationService';
import { formatDate } from '../../utils/formatDate';
import { TopProductCard } from '../../components/TopProductCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { unreadCount } from '../../utils/notificationStore';
import { color } from '../../../color';
import {
  UserResponse,
  ItemsResponse,
  StoriesResponse,
} from '../../../interface';

export default function HomeScreen() {
  const { userData, setUserData, sessionId, clearAllData } = useUserContext();

  const [number, setNumber] = useState('');
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeBtn, setActiveBtn] = useState('statistics');
  const [activeSections, setActiveSections] = useState<number[]>([1]);
  const [sections] = useState([
    { title: 'First Item', content: "This is the first item's content" },
  ]);

  const [showCashback, setShowCashback] = useState(false);

  useEffect(() => {
    const fetchShowCashback = async () => {
      const value = await AsyncStorage.getItem('showCashback');
      setShowCashback(value === 'true');
    };
    fetchShowCashback();
  }, []);

  useEffect(() => {
    const setShowCashbackAsync = async () => {
      await AsyncStorage.setItem(
        'showCashback',
        showCashback ? 'true' : 'false',
      );
    };
    setShowCashbackAsync();
  }, [showCashback]);

  const [unread, setUnread] = useState(0);

  useEffect(
    useCallback(() => {
      const fetchCount = async () => {
        const count = await unreadCount();
        setUnread(count);
      };
      fetchCount();
    }, []),
    [navigation, unread],
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('layout.home'),
      title: t('layout.home'),
      headerTitleAlign: 'left',
      headerShadowVisible: false, // iOS uchun
      headerRight: () => {
        return (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            // onPress={() => navigate('notifications')}
            onPress={() => console.log('notification')}
          >
            <Ionicons name="notifications" size={28} color="red" />
            <View
              style={{
                position: 'absolute',
                right: -2,
                top: 0,
                zIndex: 10,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: color.primary,
              }}
            >
              <Text
                style={{
                  color: color.primary,
                  textAlign: 'center',
                  fontSize: 10,
                  width: 14,
                  height: 14,
                }}
              >
                {unread}
              </Text>
            </View>
          </TouchableOpacity>
        );
      },
    });
  }, [i18n.language, navigation]);

  const {
    data: cashbackUserData,
    loading: cashbackUserLoading,
    error: cashbackUserError,
    refetch: refetchUserData,
  } = useFetch<UserResponse>(async () => {
    if (number) {
      return await CashbackUser({ phoneNumber: number, sessionId });
    }
  }, false);
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const number = await AsyncStorage.getItem('phoneNumber');
      if (number) {
        setNumber(number);
      } else {
        clearAllData();
        replace('login');
      }
    };
    fetchPhoneNumber();
  }, []);

  // useEffect(() => {
  //   const initPush = async () => {
  //     let permissionGranted = false;

  //     if (Platform.OS === 'android') {
  //       permissionGranted = await requestAndroidPermission();
  //     } else if (Platform.OS === 'ios') {
  //       permissionGranted = await requestIosPermission();
  //     }

  //     if (!permissionGranted) {
  //       console.log('🚫 Notification uchun ruxsat berilmadi');
  //       return;
  //     }
  //     const token = await getFcmToken();

  //     if (token && token !== cashbackUserData?.data?.notificationToken) {
  //       const res = await NotificationRegister({
  //         token,
  //         cardCode: cashbackUserData?.data?.cardCode,
  //         sessionId,
  //       });
  //       console.log('📤 Token backendga jo‘natildi:', res);
  //       console.log('Token:', token);
  //     }
  //   };

  //   initPush();
  //   setupForegroundListener();
  //   setupBackgroundHandler();
  //   checkInitialNotification();
  // }, [cashbackUserData]);

  useEffect(() => {
    if (!cashbackUserLoading && cashbackUserData?.data.blocked === true) {
      // orqaga tugmani bloklaymiz
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true,
      );

      Alert.alert(
        t('login.errAlertH'),
        t('login.errAlertB1'),
        [
          {
            text: 'OK',
            onPress: () => {
              navigate('login');
            },
          },
        ],
        { cancelable: false }, // orqaga bosib yopib bo‘lmasin
      );

      return () => backHandler.remove();
    }
  }, [cashbackUserData]);

  const {
    data: topItemsData,
    loading: topItemsLoading,
    error: topItemsError,
    refetch: refetchTopItems,
  } = useFetch<ItemsResponse>(async () => {
    if (userData?.cardCode) {
      return await TopItems({ cardCode: userData.cardCode, sessionId });
    }
  });

  const {
    data: storiesData,
    loading: storiesLoading,
    error: storiesError,
  } = useFetch<StoriesResponse>(async () => {
    return await News({ sessionId });
  });

  useEffect(() => {
    if (cashbackUserData) setUserData(cashbackUserData.data);
  }, [cashbackUserData]);

  useEffect(() => {
    setRefreshing(true);
    onRefresh();
  }, [number]);

  useEffect(() => {
    const fetchTopItems = async () => {
      if (userData?.cardCode) await refetchTopItems();
      setRefreshing(false);
    };
    fetchTopItems();
  }, [userData]);

  const onRefresh = async () => {
    try {
      await refetchUserData();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const _renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerInner}>
        <Text style={styles.headerText}>Furni Asia</Text>
        <Text style={styles.headerText}>{userData?.cardName || ''}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {showCashback ? (
          <Text style={styles.cashbackText}>
            {userData?.currentCashback?.toLocaleString?.() || 0} UZS
          </Text>
        ) : (
          <Text style={styles.cashbackText}>**********</Text>
        )}
        <TouchableOpacity
          style={{ paddingHorizontal: 10 }}
          onPress={() => setShowCashback(!showCashback)}
        >
          {showCashback ? (
            <Ionicons name="eye-off" size={28} color="#facc15" />
          ) : (
            <Ionicons name="eye-sharp" size={28} color="#facc15" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const _renderContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.buttonRow}>
        {['statistics', 'bonuses'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setActiveBtn(type)}
            style={[
              styles.tabButton,
              activeBtn === type ? styles.activeTab : styles.inactiveTab,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeBtn === type
                  ? styles.activeTabText
                  : { color: color.primary },
              ]}
            >
              {t(`home.btn${type === 'statistics' ? 1 : 2}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeBtn === 'statistics' && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsHeader}>{t('home.header2')}</Text>
          {['monthly', 'quarterly'].map((period, idx) => (
            <View key={idx} style={styles.statsItem}>
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>{t(`home.${period}1`)}</Text>
                <Text style={styles.statsValue}>
                  {userData &&
                    ((period === 'monthly'
                      ? userData.monthlyFact
                      : period === 'quarterly'
                      ? userData.quarterlyFact
                      : 0
                    )?.toLocaleString?.() ||
                      0)}{' '}
                  UZS
                </Text>
              </View>
              {idx === 0 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}

      {activeBtn === 'bonuses' && (
        <View style={styles.bonusesContainer}>
          {(userData?.lastCashbacks ?? []).length > 0 ? (
            (userData?.lastCashbacks ?? []).map((item, index) => (
              <View key={index} style={styles.bonusItem}>
                <Text style={styles.bonusAmount}>
                  {item.amount.toLocaleString()} UZS
                </Text>
                <Text style={styles.bonusDate}>{formatDate(item.date)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyBonuses}>
              <Text style={styles.emptyBonusesText}>{t('home.text')}</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={() => navigate('history')}
        style={styles.historyButton}
      >
        <FontAwesome5 name="history" color="gold" size={18} />
        <Text style={styles.historyButtonText}>{t('home.btn3')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[color.primary]}
        />
      }
      style={styles.mainContainer}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {storiesLoading ? (
          [...Array(4)].map((_, i) => (
            <View key={i} style={styles.circleContainer}>
              <Image
                style={styles.innerImage}
                source={require('../../assets/icon.png')}
              />
            </View>
          ))
        ) : storiesData?.data?.length ? (
          storiesData.data.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() =>
                navigate('story', {
                  image: item.fullSizeImage,
                  link: item.link,
                })
              }
              style={styles.circleContainer}
            >
              <Image
                style={styles.innerImage}
                source={{ uri: item.thumbnailImage }}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View></View>
        )}
      </ScrollView>

      <View style={styles.contentWrapper}>
        <Accordion
          underlayColor="transparent"
          sections={sections}
          activeSections={activeSections}
          renderHeader={_renderHeader}
          renderContent={_renderContent}
          onChange={setActiveSections}
        />

        <View style={styles.promotionsHeader}>
          <Text style={styles.promotionsTitle}>{t('home.promotions')}</Text>
        </View>

        <View style={styles.itemsContainer}>
          {topItemsLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator color={color.primary} size={'large'} />
            </View>
          ) : topItemsData?.data?.length ? (
            topItemsData.data.map((item, i) => (
              <TopProductCard
                key={i}
                itemImage={item.itemImage}
                discountApplied={item.discountApplied}
                discountedPrice={item.discountedPrice}
                price={item.price}
                itemName={item.itemName}
                item={item}
              />
            ))
          ) : !topItemsLoading ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text
                style={{ padding: 16, textAlign: 'center', color: 'black' }}
              >
                {t('home.noItems')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  circleContainer: {
    width: 80,
    height: 80,
    marginHorizontal: 7,
    borderWidth: 3,
    borderRadius: 999,
    padding: 5,
    borderColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerImage: {
    backgroundColor: 'white',
    width: 70,
    height: 70,
    borderRadius: 999,
    resizeMode: 'cover',
  },

  contentWrapper: {
    marginTop: 8,
    flexDirection: 'column',
    gap: 12,
  },
  headerContainer: {
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    backgroundColor: color.primary,
    borderRadius: 20,
    padding: 12,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  cashbackText: {
    fontSize: 18,
    paddingVertical: 8,
    fontWeight: '800',
    color: '#facc15',
  },
  contentContainer: {
    marginHorizontal: 8,
    padding: 12,
    margin: 4,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4.59,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  tabButton: {
    flex: 1,
    padding: 8,
    width: '48%',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: color.primary,
    borderWidth: 1,
    borderColor: color.primary,
  },
  inactiveTab: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: color.primary,
  },
  tabButtonText: {
    textAlign: 'center',
    fontSize: 16,
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hidden: {
    display: 'none',
  },
  statsContainer: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 8,
    borderRadius: 16,
  },
  statsHeader: {
    color: color.darkGray,
    fontSize: 14,
  },
  statsItem: {
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: color.darkGray,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  divider: {
    backgroundColor: 'black',
    height: 1,
    marginVertical: 8,
  },
  bonusesContainer: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 8,
    borderRadius: 16,
  },
  bonusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderStyle: 'dotted',
  },
  bonusAmount: {
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 4,
    fontWeight: 'bold',
    color: 'black',
  },
  bonusDate: {
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 4,
    fontWeight: 500,
    color: 'black',
  },
  emptyBonuses: {
    paddingVertical: 8,
    height: 193,
    justifyContent: 'center',
  },
  emptyBonusesText: {
    fontSize: 14,
    textAlign: 'center',
    color: color.darkGray,
  },
  historyButton: {
    width: '100%',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
  promotionsHeader: {
    marginHorizontal: 8,
  },
  promotionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  itemsContainer: {
    marginHorizontal: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
