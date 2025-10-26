import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useLayoutEffect } from 'react';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import useFetch from '../../api/useFetch';
import { OrdersData } from '../../api/get';
import { formatDate } from '../../utils/formatDate';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { OrderResponce } from '../../../interface';
import { color } from '../../../color';

export default function OrderDetails({ route }: any) {
  const { sessionId } = useUserContext();
  const { params } = route.params;
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  useEffect(() => {
    navigation.setOptions({
      title: `${t('order.title')} - ${String(params)}`,
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

  const { data, loading, error } = useFetch<OrderResponce>(async () => {
    return await OrdersData({ id: String(params), sessionId: sessionId });
  });

  return (
    <View style={styles.container}>
      {!loading && data ? (
        <View style={styles.box}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  marginBottom: 2,
                  color: 'black',
                }}
              >
                {t('order.date')}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  marginBottom: 2,
                  color: 'black',
                }}
              >
                {t('order.totalCost')}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: 'right',
                  color: 'black',
                  marginBottom: 2,
                }}
              >
                {formatDate(data.data.docDate)}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: 'right',
                  marginBottom: 2,
                  color: 'black',
                }}
              >
                {data.data.docTotalUZS.toLocaleString()} UZS
              </Text>
            </View>
          </View>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginVertical: 5,
                textAlign: 'center',
                color: 'black',
              }}
            >
              {t('order.products')}
            </Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {data.data.lines.map((item, i) => {
              return (
                <View
                  key={item.itemCode}
                  style={{
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    borderRadius: 20,
                    padding: 4,
                    marginBottom: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                    elevation: 2,
                    marginHorizontal: 4,
                  }}
                >
                  <View
                    style={{ position: 'relative', marginVertical: 'auto' }}
                  >
                    {item.itemImage ? (
                      <Image
                        source={{ uri: item.itemImage }}
                        style={{
                          width: 120,
                          height: 120,
                          resizeMode: 'cover',
                          borderRadius: 20,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 120,
                          height: 120,
                          backgroundColor: color.gray,
                          borderRadius: 12,
                        }}
                      />
                    )}
                    {item.discountPercent > 0 && (
                      <View
                        style={{
                          backgroundColor: color.primary,
                          borderRadius: 20,
                          paddingVertical: 4,
                          paddingHorizontal: 12,
                          position: 'absolute',
                          top: 85,
                          left: 8,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: 'white' }}>
                          {String(item.discountPercent.toFixed())}%
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ padding: 8, flex: 1 }}>
                    <Text
                      numberOfLines={3}
                      style={{
                        flexWrap: 'wrap',
                        fontSize: 16,
                        fontWeight: 'semibold',
                        color: 'black',
                      }}
                    >
                      {item.description}
                    </Text>

                    <View>
                      <Text
                        style={{
                          color: 'black',
                        }}
                      >
                        {t('order.quantity')}: {item.quantity}
                      </Text>
                      <Text style={{ color: 'black' }}>
                        {t('order.price')}: {item.price.toLocaleString()} UZS
                      </Text>
                      {item.freeItemQuantity >= 1 && (
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <AntDesign
                            name="gift"
                            size={24}
                            color={color.primary}
                          />
                          <Text
                            style={{
                              color: 'black',
                            }}
                          >
                            {t('cart.freeItem')}{' '}
                          </Text>
                          <Text
                            style={{
                              color: 'black',
                            }}
                          >
                            :
                          </Text>
                          <Text
                            style={{
                              color: 'black',
                            }}
                          >
                            {item.freeItemQuantity.toString()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 8,
                        alignItems: 'center',
                        justifyContent: 'space-around',
                      }}
                    ></View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
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
    padding: 8,
    alignItems: 'center',
  },
  box: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
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
});
