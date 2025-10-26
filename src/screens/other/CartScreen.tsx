import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useEffect, useState } from 'react';
import RadioGroup from 'react-native-radio-buttons-group';
import { t } from 'i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../utils/UserContext';
import { useNavigation } from '@react-navigation/native';
import useFetch from '../../api/useFetch';
import { ShopAddress } from '../../api/get';
import { SetOrder } from '../../api/post';
import { goBack, navigate } from '../../utils/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InvoiceLine, ShopAddressData } from '../../../interface';
import { color } from '../../../color';

export default function CartScreen() {
  const {
    cartItem,
    setCartItem,
    userData,
    sessionId,
    selectedLocation,
    setSelectedLocation,
  } = useUserContext();
  const { i18n } = useTranslation();
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('layout.cart'),
      headerTitleAlign: 'center',
      headerShadowVisible: false,
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
    loading: shopAddressLoading,
    data: shopAddressData,
    error: shopAddressError,
  } = useFetch(async () => {
    return await ShopAddress({ sessionId: sessionId });
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [comment, setComment] = useState('');
  const [wareHouseCode, setWareHouseCode] = useState<ShopAddressData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [marketModalVisible, setMarketModalVisible] = useState(false);
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);
  const windowHeight = Dimensions.get('window').height;
  const clearStorage = async () => {
    try {
      setCartItem(null);
      setClearCartModalVisible(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const increment = (item: InvoiceLine) => {
    if (item.quantity >= (item.maxQuantity - item.freeItemQuantity || 10))
      return;

    setCartItem((prevCartItems: InvoiceLine[]) => {
      if (!prevCartItems) return null;

      const newCart = prevCartItems.map(cartItem =>
        cartItem.itemCode === item.itemCode
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      );

      try {
        return newCart;
      } catch (error) {
        return prevCartItems;
      }
    });
  };
  const decrement = (item: InvoiceLine) => {
    setCartItem((prevCartItems: InvoiceLine[]) => {
      if (!prevCartItems) return null;

      if (item.quantity <= 1) {
        // Quantity 1 bo‘lsa, o‘chiramiz
        return prevCartItems.filter(
          cartItem => cartItem.itemCode !== item.itemCode,
        );
      }

      // Aks holda quantityni kamaytiramiz
      return prevCartItems.map(cartItem =>
        cartItem.itemCode === item.itemCode
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem,
      );
    });
  };

  const deleteItem = (item: InvoiceLine) => {
    // Remove the product if quantity would be less than 1
    setCartItem((prevCartItems: InvoiceLine[]) => {
      if (!prevCartItems) return null;

      const newCart = prevCartItems.filter(
        cartItem => cartItem.itemCode !== item.itemCode,
      );

      try {
        return newCart;
      } catch (error) {
        return prevCartItems;
      }
    });
    return;
  };

  const calculateTotal = () => {
    if (!cartItem || cartItem.length === 0) return 0;
    return cartItem.reduce((acc: number, item: InvoiceLine) => {
      const price =
        item.price > item.discountedPrice ? item.discountedPrice : item.price;
      return acc + price * item.quantity;
    }, 0);
  };

  const showToast = () => {
    Toast.show({
      type: 'success',
      text1: t('cart.toastS'),
      text2: t('cart.toastSuccess'),
      text1Style: { fontSize: 18, fontWeight: 'bold', color: 'green' },
      text2Style: { fontSize: 14, color: '#eeeee' },
      topOffset: 60,
    });
  };

  const handleOrderConfirmation = async () => {
    if (!cartItem || cartItem.length === 0) {
      Alert.alert(t('cart.error'), t('cart.emptyCart'));
      return;
    }

    // Validate required fields based on delivery method
    if (deliveryMethod === 'pickup' && !wareHouseCode) {
      Alert.alert(t('cart.error'), t('cart.selectMar'));
      return;
    }

    if (deliveryMethod === 'delivery' && !selectedLocation) {
      Alert.alert(t('cart.error'), t('cart.selectLoc'));
      return;
    }

    const orderDetails = {
      comments: comment,
      wareHouseCode:
        deliveryMethod === 'pickup' ? wareHouseCode?.shopCode : null,
      shopCode: deliveryMethod === 'pickup' ? wareHouseCode?.shopCode : null,
      latitude:
        deliveryMethod === 'delivery' ? selectedLocation?.latitude : null,
      longitude:
        deliveryMethod === 'delivery' ? selectedLocation?.longitude : null,
      lines: cartItem,
      phone: userData?.phone,
      docTotalUZS: calculateTotal(),
      docDate: new Date().toISOString(),
      cardCode: userData?.cardCode,
    };

    try {
      setLoading(true);
      const result = await SetOrder({
        orderDetails: orderDetails,
        sessionId: sessionId,
      });

      if (result.status === 'success') {
        clearStorage();
        showToast();
        goBack();
      } else if (result.error) {
        Alert.alert(t('cart.error'), result.error.message);
      }
    } catch (error) {
      Alert.alert(t('cart.error'), t('cart.errorText'));
    } finally {
      setModalVisible(false);
      setLoading(false);
      setComment('');
      setWareHouseCode(null);
    }
  };

  useEffect(() => {
    if (selectedLocation && !modalVisible) {
      setModalVisible(true);
    }
  }, [selectedLocation, modalVisible]);

  // ChangeQuantityModal
  const [selectedItem, setSelectedItem] = useState<InvoiceLine>();
  const [changeQuantityModalVisible, setChangeQuantityModalVisible] =
    useState(false);
  const [value, setValue] = useState(3);

  const updateQuantity = (item: InvoiceLine, newQuantity: number) => {
    const clampedQuantity = Math.max(
      1,
      Math.min(newQuantity, item.maxQuantity - item.freeItemQuantity),
    );

    setCartItem(
      (prev: InvoiceLine[]) =>
        prev?.map((cartItem: InvoiceLine) =>
          cartItem.itemCode === item.itemCode
            ? { ...cartItem, quantity: clampedQuantity }
            : cartItem,
        ) || null,
    );
  };

  const handleQuantityPress = (val: string) => {
    setValue(prev => {
      const newVal = Number(String(prev === 0 ? '' : prev) + val);
      return newVal;
    });
  };
  const handleQuantityDelete = () => {
    setValue(prev => {
      const str = String(prev);
      const sliced = str.slice(0, -1);
      return sliced ? Number(sliced) : 0;
    });
  };

  const handleQuantityClear = () => {
    setValue(0);
  };
  const handleAccept = () => {
    if (selectedItem) {
      updateQuantity(selectedItem, value);
      setChangeQuantityModalVisible(false);
      handleQuantityClear();
    } else {
      Alert.alert('ERROR', 'Modal error');
      handleQuantityClear();
    }
  };
  useEffect(() => {
    setValue(0);
  }, [changeQuantityModalVisible]);

  // isFreeItems
  const updateFreeQuantities = (items: InvoiceLine[]) => {
    if (!items) return [];

    return items.map(item => {
      if (!item.paidQuantity || !item.freeQuantity || !item.maxFreeQuantity) {
        return item;
      }

      // Calculate how many paid sets were ordered
      const paidSets = Math.floor(item.quantity / item.paidQuantity);
      // Calculate free quantity for each set
      const calculatedFree = paidSets * item.freeQuantity;
      // Limit to maximum free quantity
      const finalFreeQuantity = Math.min(calculatedFree, item.maxFreeQuantity);

      return {
        ...item,
        freeItemQuantity: finalFreeQuantity,
      };
    });
  };

  // Update free quantities when cart items change
  useEffect(() => {
    if (cartItem && cartItem.length > 0) {
      const updatedCart = updateFreeQuantities(cartItem);
      if (JSON.stringify(updatedCart) !== JSON.stringify(cartItem)) {
        setCartItem(updatedCart);
      }
    }
  }, [cartItem]);

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState<InvoiceLine | null>(null);

  return (
    <>
      <View style={{ flex: 1, backgroundColor: 'white', padding: 8 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingVertical: 4, marginVertical: 8, height: '100%' }}
        >
          {cartItem?.map((item: InvoiceLine, index: number) => (
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
              <View style={{ position: 'relative', marginVertical: 'auto' }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setPreviewItem(item);
                    setImagePreviewVisible(true);
                  }}
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
                </TouchableOpacity>
                {item.discountPercent > 0 && (
                  <View
                    style={{
                      backgroundColor: 'rgba(220, 38, 38, 0.7)',
                      borderRadius: 20,
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      position: 'absolute',
                      top: 90,
                      left: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: 'white' }}>
                      {String(item.discountPercent.toFixed())}%
                    </Text>
                  </View>
                )}
                {item.cashbackPercent > 0 && (
                  <View
                    style={{
                      backgroundColor: 'rgba(0, 196, 7, 0.7)',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 20,
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    >
                      {String(item.cashbackPercent.toFixed())} %
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
                {item.discountPercent > 0 && (
                  <Text
                    style={{
                      color: color.darkGray,
                      fontSize: 14,
                      fontWeight: 'semibold',
                      textDecorationLine: 'line-through',
                    }}
                  >
                    {String(item.price.toLocaleString())} UZS
                  </Text>
                )}

                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'regular',
                    color: 'black',
                  }}
                >
                  {String(
                    item.discountPercent > 0
                      ? item.priceBeforeDiscount.toLocaleString()
                      : item.price.toLocaleString(),
                  )}{' '}
                  UZS
                </Text>
                <View>
                  {item.freeItemQuantity >= 1 && (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <AntDesign name="gift" size={24} color={color.primary} />
                      <Text style={{ color: 'black' }}>
                        {t('cart.freeItem')}{' '}
                      </Text>
                      <Text style={{ color: 'black' }}>:</Text>
                      <Text style={{ color: 'black' }}>
                        {' '}
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
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => decrement(item)}
                      activeOpacity={item.quantity > 1 ? 0.8 : 1}
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 999,
                        width: 40,
                        height: 40,
                        backgroundColor:
                          item.quantity > 1 ? color.darkGray : color.gray,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: 'black' }}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setChangeQuantityModalVisible(true);
                        setSelectedItem(item);
                      }}
                      activeOpacity={1}
                    >
                      <Text
                        style={{
                          width: 44,
                          fontSize: 16,
                          textAlign: 'center',
                          marginHorizontal: 4,
                          color: 'black',
                        }}
                      >
                        {item.quantity.toString()}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => increment(item)}
                      activeOpacity={
                        item.quantity + item.freeItemQuantity < item.maxQuantity
                          ? 0.8
                          : 1
                      }
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 999,
                        width: 40,
                        height: 40,
                        backgroundColor:
                          item.quantity + item.freeItemQuantity <
                          item.maxQuantity
                            ? color.darkGray
                            : color.gray,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color:
                            item.quantity >= item.maxQuantity
                              ? color.darkGray
                              : 'black',
                        }}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => deleteItem(item)}
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons
                      name="delete"
                      size={36}
                      color={color.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {cartItem && cartItem.length > 0 ? (
          <SafeAreaView
            style={{ backgroundColor: 'transparent', marginTop: -40 }}
          >
            <View
              style={{
                flexDirection: 'row',
                padding: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{ color: 'black', fontSize: 16, fontWeight: 'medium' }}
              >
                {t('cart.total')}
              </Text>
              <Text
                style={{ color: 'black', fontSize: 16, fontWeight: 'medium' }}
              >
                {calculateTotal().toLocaleString()} UZS
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: '48%',
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  borderRadius: 20,
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: color.primary,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setClearCartModalVisible(true)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'medium',
                    textAlign: 'center',
                    color: color.primary,
                  }}
                >
                  {t('cart.clear')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: '48%',
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  borderRadius: 20,
                  backgroundColor: color.primary,
                  borderWidth: 1,
                  borderColor: color.primary,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setModalVisible(true)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'medium',
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  {t('cart.txt1')}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        ) : (
          <View
            style={{
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Text style={{ color: color.darkGray, fontSize: 16 }}>
              {t('cart.emptyCart')}
            </Text>
          </View>
        )}

        <Modal
          statusBarTranslucent
          visible={modalVisible}
          transparent
          animationType="none"
        >
          <KeyboardAvoidingView
            style={{ height: windowHeight, justifyContent: 'center' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled={true}
          >
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                width: '100%',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  width: '100%',
                  borderRadius: 20,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'medium',
                    textAlign: 'center',
                    marginBottom: 4,
                  }}
                >
                  {t('cart.txt1')}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'medium',
                    marginVertical: 5,
                    color: 'black',
                  }}
                >
                  {t('cart.type')}
                </Text>
                <View
                  style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                  }}
                >
                  <RadioGroup
                    radioButtons={[
                      {
                        id: 'pickup',
                        label: t('cart.delMet2'),
                        value: 'pickup',
                      },
                      {
                        id: 'delivery',
                        label: t('cart.delMet1'),
                        value: 'delivery',
                      },
                    ]}
                    onPress={value => setDeliveryMethod(value)}
                    selectedId={deliveryMethod}
                    labelStyle={{ color: 'black' }}
                    layout="row"
                  />
                  {deliveryMethod === 'pickup' ? (
                    <View style={{ marginTop: 12, width: '100%' }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: color.gray,
                          width: '100%',
                          padding: 12,
                          borderRadius: 20,
                        }}
                        onPress={() => {
                          setModalVisible(false);
                          setMarketModalVisible(true);
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            fontWeight: 'medium',
                            color: 'black',
                          }}
                        >
                          {wareHouseCode !== null
                            ? wareHouseCode.shopName
                            : t('cart.selectMar')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ width: '100%', marginTop: 12 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible(false);
                          navigate('selectLocation');
                        }}
                        activeOpacity={0.8}
                        style={{
                          backgroundColor: color.gray,
                          width: '100%',
                          padding: 12,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            fontWeight: 'medium',
                            color: 'black',
                          }}
                        >
                          {selectedLocation
                            ? t('cart.selLoc')
                            : t('cart.selectLoc')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'medium',
                      marginVertical: 10,
                      color: 'black',
                    }}
                  >
                    {t('cart.comments')}
                  </Text>
                  <TextInput
                    onChangeText={text => setComment(text)}
                    multiline
                    placeholderTextColor={color.darkGray}
                    style={{
                      backgroundColor: color.gray,
                      borderRadius: 20,
                      padding: 12,
                      fontSize: 16,
                      minHeight: 100,
                      textAlignVertical: 'top',
                      color: 'black',
                    }}
                    placeholder={t('cart.comment')}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 12,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: '48%',
                      paddingHorizontal: 15,
                      paddingVertical: 15,
                      borderRadius: 20,
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: color.primary,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'medium',
                        color: color.primary,
                        textAlign: 'center',
                      }}
                    >
                      {t('cart.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: '48%',
                      paddingHorizontal: 15,
                      paddingVertical: 15,
                      borderRadius: 20,
                      backgroundColor: color.primary,
                      borderWidth: 1,
                      borderColor: color.primary,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={handleOrderConfirmation}
                  >
                    {loading ? (
                      <ActivityIndicator size={'small'} color={'white'} />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'medium',
                          color: 'white',
                          textAlign: 'center',
                        }}
                      >
                        {t('cart.confirm')}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        <Modal
          statusBarTranslucent
          visible={marketModalVisible}
          transparent
          animationType="fade"
        >
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <View
              style={{
                height: windowHeight - 150,
                backgroundColor: 'white',
                width: '100%',
                borderRadius: 20,
                padding: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'medium',
                  marginVertical: 10,
                  textAlign: 'center',
                  color: 'black',
                }}
              >
                {t('cart.selectMar')}
              </Text>
              <ScrollView
                style={{
                  backgroundColor: 'white',
                }}
                showsVerticalScrollIndicator={false}
              >
                {shopAddressData?.data.length > 0 ? (
                  shopAddressData.data.map((item: ShopAddressData) => (
                    <TouchableOpacity
                      key={item.shopCode}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.18,
                        shadowRadius: 4.59,
                        elevation: 5,
                        borderRadius: 20,
                        backgroundColor: 'white',
                        margin: 8,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onPress={() => {
                        setWareHouseCode(item);
                        setMarketModalVisible(false);
                        setModalVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <View>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 'medium',
                            color: 'black',
                          }}
                        >
                          {item.shopName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: color.darkGray,
                            fontWeight: 'medium',
                          }}
                        >
                          {item.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View
                    style={{
                      backgroundColor: 'white',
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <ActivityIndicator size={'large'} color={color.primary} />
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal
          statusBarTranslucent
          visible={clearCartModalVisible}
          onRequestClose={() => setClearCartModalVisible(false)}
          transparent
          animationType="fade"
        >
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 8,
              }}
            >
              <View>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    paddingBottom: 20,
                    color: 'black',
                  }}
                >
                  {t('cart.confirm_clear')}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setClearCartModalVisible(false)}
                  style={{
                    width: '48%',
                    paddingHorizontal: 15,
                    paddingVertical: 15,
                    borderRadius: 20,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: color.primary,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'medium',
                      textAlign: 'center',
                      color: color.primary,
                    }}
                  >
                    {t('cart.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    width: '48%',
                    paddingHorizontal: 15,
                    paddingVertical: 15,
                    borderRadius: 20,
                    backgroundColor: color.primary,
                    borderWidth: 1,
                    borderColor: color.primary,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={clearStorage}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'medium',
                      textAlign: 'center',
                      color: 'white',
                    }}
                  >
                    {t('cart.confirm')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          statusBarTranslucent
          visible={changeQuantityModalVisible}
          transparent
          animationType="fade"
        >
          <TouchableOpacity
            onPress={() => {
              setChangeQuantityModalVisible(false);
            }}
            style={changeQuantityModalStyles.overlay}
            activeOpacity={1}
          >
            <TouchableOpacity
              style={changeQuantityModalStyles.modal}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
            >
              {/* Kiritilgan son */}
              <Text style={changeQuantityModalStyles.inputText}>
                {value || '0'}
              </Text>

              {/* Raqamlar */}
              <View style={changeQuantityModalStyles.numpad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'].map(
                  (val, index) => (
                    <TouchableOpacity
                      key={index}
                      style={
                        val !== ''
                          ? changeQuantityModalStyles.key
                          : { width: 80, height: 80, margin: 5 }
                      }
                      onPress={() => handleQuantityPress(val)}
                    >
                      <Text style={changeQuantityModalStyles.keyText}>
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}

                {/* O'chirish tugma */}
                <TouchableOpacity
                  style={changeQuantityModalStyles.key}
                  onPress={handleQuantityDelete}
                >
                  <Ionicons
                    name="backspace-outline"
                    size={36}
                    color={color.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Pastdagi tugmalar */}
              <View style={changeQuantityModalStyles.buttons}>
                <TouchableOpacity
                  style={changeQuantityModalStyles.cancelBtn}
                  onPress={() => {
                    handleQuantityClear();
                  }}
                >
                  <Text
                    style={[
                      changeQuantityModalStyles.buttonText,
                      { color: 'black' },
                    ]}
                  >
                    {t('cart.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={changeQuantityModalStyles.acceptBtn}
                  onPress={handleAccept}
                >
                  <Text style={changeQuantityModalStyles.buttonText}>
                    {t('cart.confirm')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
      <Modal
        statusBarTranslucent
        visible={imagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        {/* qora fon */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setImagePreviewVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          {/* oq karta (bosganda yopilib ketmasligi uchun alohida TouchableOpacity) */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: 'white',
              borderRadius: 20,
              paddingTop: 40,
              paddingBottom: 16,
              paddingHorizontal: 16,
              position: 'relative',
              alignItems: 'center',
            }}
          >
            {/* Yopish tugmasi */}
            <TouchableOpacity
              onPress={() => setImagePreviewVisible(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#00000066',
                borderRadius: 16,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 14,
                  lineHeight: 16,
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>

            {/* katta rasm */}
            {previewItem?.itemImage ? (
              <Image
                source={{ uri: previewItem.itemImage }}
                style={{
                  width: '100%',
                  height: 250,
                  borderRadius: 12,
                  resizeMode: 'contain',
                  backgroundColor: 'white',
                }}
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  height: 250,
                  borderRadius: 12,
                  backgroundColor: color.gray,
                }}
              />
            )}

            {/* nomi */}
            <Text
              style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: '600',
                color: '#111',
                textAlign: 'center',
              }}
              numberOfLines={3}
            >
              {previewItem?.description || ''}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
const changeQuantityModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
  },
  modal: {
    zIndex: 5,
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
  },
  inputText: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
    color: color.primary,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 80,
    margin: 5,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  keyText: {
    fontSize: 24,
    color: '#000',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelBtn: {
    borderRadius: 20,
    width: '48%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: color.gray,
  },
  acceptBtn: {
    borderRadius: 20,
    width: '48%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: color.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
