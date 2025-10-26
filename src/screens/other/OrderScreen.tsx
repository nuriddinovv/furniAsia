import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import useFetch from '../../api/useFetch';
import { OrdersData } from '../../api/get';
import { navigate } from '../../utils/NavigationService';
import { formatDate } from '../../utils/formatDate';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { color } from '../../../color';
import { OrdersResponce } from '../../../interface';

export default function OrderScreen() {
  const { sessionId, userData } = useUserContext();
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  useEffect(() => {
    navigation.setOptions({
      headerShadowVisible: false,
      title: t('layout.orders'),
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
  }),
    [i18n.language];

  const { data, loading, error } = useFetch<OrdersResponce>(async () => {
    if (userData) {
      return await OrdersData({
        sessionId: sessionId,
        cardCode: userData?.cardCode,
      });
    }
  });
  if (data?.error) {
    Alert.alert(t('cart.error', data.error.message));
  }
  const [activeBtn, setActiveBtn] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.btnWrapper}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: activeBtn ? color.primary : 'white',
            },
          ]}
          activeOpacity={0.8}
          onPress={() => setActiveBtn(true)}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: activeBtn ? 'white' : color.primary,
            }}
          >
            {t('orders.new')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: !activeBtn ? color.primary : 'white',
            },
          ]}
          activeOpacity={0.8}
          onPress={() => setActiveBtn(false)}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: activeBtn ? color.primary : 'white',
            }}
          >
            {t('orders.all')}
          </Text>
        </TouchableOpacity>
      </View>
      {activeBtn && data && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data.data.filter((item: any) => item.orderStatus === 'New')}
          keyExtractor={item => item.docEntry.toString()}
          ListEmptyComponent={() => {
            return (
              <View
                style={[
                  styles.container,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: 300,
                  },
                ]}
              >
                <Text style={{ fontSize: 16, color: 'black' }}>
                  {t('orders.noOrders')}
                </Text>
                <TouchableOpacity onPress={() => navigate('market')}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: color.primary,
                      textDecorationLine: 'underline',
                    }}
                  >
                    {t('orders.goMagazine')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigate('orderDetails', { params: item.docEntry });
              }}
              activeOpacity={0.8}
              key={item.docEntry}
              style={styles.cartContainer}
            >
              {/* Header */}
              <View style={styles.cartHeader}>
                <View style={styles.cartBody}>
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        marginBottom: 8,
                        color: 'black',
                      }}
                    >
                      {item.orderStatus}
                    </Text>
                    <Text style={{ fontSize: 14, color: color.darkGray }}>
                      {formatDate(item.docDate)}
                    </Text>
                    <Text style={{ fontSize: 14, color: color.darkGray }}>
                      {item.docTime}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      textAlign: 'right',
                      color: 'black',
                    }}
                  >
                    {item.docTotalUZS.toLocaleString()} UZS
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {!activeBtn && data && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data.data}
          keyExtractor={item => item.docEntry.toString()}
          ListEmptyComponent={() => {
            return (
              <View
                style={[
                  styles.container,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: 300,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{t('orders.noOrders')}</Text>
                <TouchableOpacity onPress={() => navigate('market')}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: color.primary,
                      textDecorationLine: 'underline',
                    }}
                  >
                    {t('orders.goMagazine')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigate('orderDetails', { params: item.docEntry });
              }}
              activeOpacity={0.8}
              key={item.docEntry}
              style={styles.cartContainer}
            >
              {/* Header */}
              <View style={styles.cartHeader}>
                <View style={styles.cartBody}>
                  <View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 500,
                        marginBottom: 8,
                        color: 'black',
                      }}
                    >
                      {item.orderStatus}
                    </Text>
                    <Text style={{ fontSize: 14, color: color.darkGray }}>
                      {formatDate(item.docDate)}
                    </Text>
                    <Text style={{ fontSize: 14, color: color.darkGray }}>
                      {item.docTime}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      textAlign: 'right',
                      color: 'black',
                    }}
                  >
                    {item.docTotalUZS.toLocaleString()} UZS
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 10,
          }}
        >
          <ActivityIndicator size={'large'} color={color.primary} />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 8,
  },
  btnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  button: {
    width: '48%',
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.primary,
  },
  cartContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginVertical: 8,
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
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
