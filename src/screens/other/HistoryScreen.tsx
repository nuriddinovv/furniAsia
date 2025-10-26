import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFetch from '../../api/useFetch';
import { HistoryData } from '../../api/get';
import { navigate } from '../../utils/NavigationService';
import { formatDate } from '../../utils/formatDate';
import { color } from '../../../color';
import { HistoryProps, Transaction } from '../../../interface';

export default function HistoryScreen() {
  const { sessionId, userData } = useUserContext();
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  useEffect(() => {
    navigation.setOptions({
      title: t('history.history'),
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
    error,
    refetch: refetchHistoryData,
  } = useFetch<HistoryProps>(async () => {
    return await HistoryData({
      cardCode: userData?.cardCode,
      sessionId: sessionId,
    });
  });
  if (data?.error) {
    Alert.alert(t('cart.error', data.error.message));
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Sales':
        return 'cart-outline';
      case 'Cashback':
        return 'cash-outline';
      default:
        return 'document-text-outline';
    }
  };

  const renderItem = ({ item }: { item: Transaction }) =>
    item.type !== 'Cashback' ? (
      <TouchableOpacity
        onPress={() => {
          navigate('historyDetails', {
            id: item.docEntry,
            type: item.type,
          });
        }}
        activeOpacity={0.8}
        key={item.docEntry}
        style={styles.transactionItem}
      >
        {/* Header */}
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            <View
              style={[
                styles.iconWrapper,
                item.type === 'Sales'
                  ? styles.salesIconBg
                  : styles.cashbackIconBg,
              ]}
            >
              <Ionicons
                name={getTransactionIcon(item.type)}
                size={28}
                color={
                  (item.type as Transaction['type']) === 'Sales'
                    ? color.primary
                    : '#16a34a'
                }
              />
            </View>
            <View>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionDate}>
                {formatDate(item.docDate)}
              </Text>
              <Text style={styles.transactionTime}>{item.docTime}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.transactionAmount}>
              {item.docTotal.toLocaleString()} UZS
            </Text>
            <Text style={styles.cashbackAccrued}>
              +{item.cashbackAccrued.toLocaleString()} UZS
            </Text>
            <Text style={styles.cashbackWithdrew}>
              -{item.cashbackWithdrew.toLocaleString()} UZS
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionId}>ID: {item.docEntry}</Text>
          {item.shopName && (
            <View style={styles.shopNameContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={color.darkGray}
              />
              <Text style={styles.shopName}>{item.shopName}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        activeOpacity={0.8}
        key={item.docEntry}
        style={styles.transactionItem}
      >
        {/* Header */}
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            <View
              style={[
                styles.iconWrapper,
                item.type === ('Sales' as Transaction['type'])
                  ? styles.salesIconBg
                  : styles.cashbackIconBg,
              ]}
            >
              <Ionicons
                name={getTransactionIcon(item.type)}
                size={28}
                color={
                  item.type === ('Sales' as Transaction['type'])
                    ? color.primary
                    : '#16a34a'
                }
              />
            </View>
            <View>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionDate}>
                {formatDate(item.docDate)}
              </Text>
              <Text style={styles.transactionTime}>{item.docTime}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.transactionAmount}>
              {item.docTotal.toLocaleString()} UZS
            </Text>
            <Text style={styles.cashbackAccrued}>
              +{item.cashbackAccrued.toLocaleString()} UZS
            </Text>
            <Text style={styles.cashbackWithdrew}>
              -{item.cashbackWithdrew.toLocaleString()} UZS
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionId}>ID: {item.docEntry}</Text>
          {item.shopName && (
            <View style={styles.shopNameContainer}>
              <Ionicons
                name="location-outline"
                size={16}
                color={color.darkGray}
              />
              <Text style={styles.shopName}>{item.shopName}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchHistoryData();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={'red'} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={data?.data}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={item => item.docEntry.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  transactionItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 24,
    margin: 8,
    borderWidth: 1,
    borderColor: color.gray,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  salesIconBg: {
    backgroundColor: '#fee2e2',
  },
  cashbackIconBg: {
    backgroundColor: '#dcfce7',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
  },
  transactionDate: {
    fontSize: 14,
    color: color.darkGray,
  },
  transactionTime: {
    fontSize: 14,
    color: color.darkGray,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    textAlign: 'right',
  },
  cashbackAccrued: {
    fontSize: 14,
    fontWeight: 600,
    color: '#16a34a',
    textAlign: 'right',
  },
  cashbackWithdrew: {
    fontSize: 14,
    fontWeight: 600,
    color: color.primary,
    textAlign: 'right',
  },
  transactionDetails: {
    paddingLeft: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionId: {
    fontSize: 14,
    color: color.darkGray,
    marginTop: 4,
  },
  shopNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  shopName: {
    fontSize: 14,
    color: color.darkGray,
    marginLeft: 4,
  },
});
