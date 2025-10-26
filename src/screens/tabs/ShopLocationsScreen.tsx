import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import useFetch from '../../api/useFetch';
import { ShopAddress } from '../../api/get';
import { navigate } from '../../utils/NavigationService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { color } from '../../../color';
import { ShopAddressResponse } from '../../../interface';

export default function Page() {
  const { sessionId } = useUserContext();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const { data, loading, error } = useFetch<ShopAddressResponse>(async () => {
    return await ShopAddress({ sessionId });
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('layout.location'),
      title: t('layout.location'),
      headerShadowVisible: false,
    });
  }, [i18n.language, navigation]);

  useEffect(() => {
    if (!loading && data?.error) {
      Alert.alert(t('cart.error'), data.error.message);
    }
  }, [loading, data]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {loading ? (
        <View style={styles.loadBox}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      ) : data?.data?.length ? (
        data.data.map(item => (
          <TouchableOpacity
            key={item.shopCode}
            onPress={() =>
              navigate('locationDetails', { shopData: JSON.stringify(item) })
            }
            style={styles.box}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.shopName}>{item.shopName}</Text>
              <Text style={styles.shopAddress}>{item.address}</Text>
            </View>
            <View style={styles.iconWrapper}>
              <Ionicons name="arrow-forward-outline" size={26} color="white" />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noDataBox}>
          <Text style={styles.noDataText}>{t('home.noItems')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: 'white',
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
    color: 'black',
    fontWeight: '500',
  },
  shopAddress: {
    fontSize: 14,
    color: color.darkGray,
  },
  iconWrapper: {
    backgroundColor: color.primary,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  loadBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noDataBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: color.darkGray,
    textAlign: 'center',
  },
});
