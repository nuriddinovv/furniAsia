import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect } from 'react';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import useFetch from '../../api/useFetch';
import { Invoices, Returns } from '../../api/get';
import { formatDate } from '../../utils/formatDate';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HistoryDetailsResponse } from '../../../interface';
import { color } from '../../../color';

export default function HistoryDetails({ route }: any) {
  const { type, id } = route.params;
  const { sessionId, userData } = useUserContext();
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const { data, loading, error } = useFetch<HistoryDetailsResponse>(
    async () => {
      if (type === 'Sales') {
        return await Invoices({ id: String(id), sessionId: sessionId });
      } else {
        return await Returns({ id: String(id), sessionId: sessionId });
      }
    },
  );
  useEffect(() => {
    navigation.setOptions({
      title:
        type === 'Sales'
          ? t('historyDetails.title1')
          : t('historyDetails.title2'),
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
  return (
    <View style={styles.container}>
      {data && (
        <View style={styles.box}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 700,
              paddingBottom: 10,
              color: 'black',
            }}
          >
            No - {String(id)}
          </Text>

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
                  marginBottom: 2,
                  color: 'black',
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
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}
              >
                <Text style={styles.cashbackAccrued}>
                  +{data.data.cashbackAccrued.toLocaleString()} UZS
                </Text>
                <Text style={styles.cashbackWithdrew}>
                  -{data.data.cashbackWithdrew.toLocaleString()} UZS
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginVertical: 5,
                textAlign: 'center',
                color: 'black',
              }}
            >
              {t('order.products')}
            </Text>
          </View>
          <ScrollView
            style={{ paddingVertical: 2 }}
            showsVerticalScrollIndicator={false}
          >
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
                    <Text style={{ flex: 1, color: 'black' }}>
                      {t('order.quantity')} {item.quantity}
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                      }}
                    >
                      {t('order.price')} {item.price.toLocaleString()} UZS
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={color.primary} />
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
  },
  cashbackAccrued: {
    fontSize: 14,
    fontWeight: 600,
    color: '#16a34a',
    textAlign: 'left',
  },
  cashbackWithdrew: {
    fontSize: 14,
    fontWeight: 600,
    color: color.primary,
    textAlign: 'right',
  },
});
