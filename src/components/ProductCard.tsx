import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { t } from 'i18next';
import { useUserContext } from '../utils/UserContext';
import { color } from '../../color';
import { ItemInterface, InvoiceLine } from '../../interface';

export function ProductCard({
  itemImage,
  discountApplied,
  discountedPrice,
  price,
  itemName,
  item,
}: {
  itemImage: string;
  discountApplied: number;
  discountedPrice: number;
  price: number;
  itemName: string;
  item: ItemInterface;
}) {
  const { cartItem, setCartItem } = useUserContext();
  const [loading, setLoading] = useState(false);

  // 👇 NEW: modal state (preview)
  const [previewVisible, setPreviewVisible] = useState(false);

  // Savatchadagi shu mahsulotni topamiz
  const cartLine: InvoiceLine | undefined = useMemo(() => {
    return cartItem?.find((c: InvoiceLine) => c.itemCode === item.itemCode);
  }, [cartItem, item.itemCode]);

  const currentQty = cartLine?.quantity ?? 0;
  const currentFree = cartLine?.freeItemQuantity ?? 0;
  const maxQty = cartLine?.maxQuantity ?? item.quantityOnStock ?? 0;

  // Free item qayta hisoblash (paid/free rules)
  const recomputeFree = (raw: InvoiceLine): number => {
    if (!raw.paidQuantity || !raw.freeQuantity || !raw.maxFreeQuantity)
      return 0;
    const paidSets = Math.floor(raw.quantity / raw.paidQuantity);
    const calculatedFree = paidSets * raw.freeQuantity;
    return Math.min(calculatedFree, raw.maxFreeQuantity);
  };

  const addToCart = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newLine: InvoiceLine = {
        itemImage: item.itemImage,
        itemCode: item.itemCode,
        description: item.itemName,
        quantity: 1,
        freeItemQuantity: 0,
        discountPercent: item.discountApplied,
        discountType: item.discountType,
        isFreeItem: false,
        cashbackPercent: item.cashbackPercent,
        priceBeforeDiscount: item.discountedPrice,
        price: item.price,
        discountedPrice: item.discountedPrice,
        warehouseCode: null,
        maxQuantity: item.quantityOnStock,
        discountLineNum: item.discountLineNum,
        freeQuantity: item.freeQuantity,
        maxFreeQuantity: item.maxFreeQuantity,
        paidQuantity: item.paidQuantity,
      };
      newLine.freeItemQuantity = recomputeFree(newLine);

      setCartItem([...(cartItem || []), newLine]);
    } catch (e) {
      console.error('Error adding item to cart:', e);
    } finally {
      setLoading(false);
    }
  };

  const increment = () => {
    if (!cartLine) return;
    const nextQty = cartLine.quantity + 1;
    const tmp: InvoiceLine = { ...cartLine, quantity: nextQty };
    const nextFree = recomputeFree(tmp);
    if (nextQty + nextFree > cartLine.maxQuantity) return;

    setCartItem((prev: InvoiceLine[] | null) =>
      prev
        ? prev.map(c =>
            c.itemCode === cartLine.itemCode
              ? { ...tmp, freeItemQuantity: nextFree }
              : c,
          )
        : prev,
    );
  };

  const decrement = () => {
    if (!cartLine) return;
    if (cartLine.quantity <= 1) {
      setCartItem((prev: InvoiceLine[] | null) =>
        prev ? prev.filter(c => c.itemCode !== cartLine.itemCode) : prev,
      );
      return;
    }
    const nextQty = cartLine.quantity - 1;
    const tmp: InvoiceLine = { ...cartLine, quantity: nextQty };
    const nextFree = recomputeFree(tmp);

    setCartItem((prev: InvoiceLine[] | null) =>
      prev
        ? prev.map(c =>
            c.itemCode === cartLine.itemCode
              ? { ...tmp, freeItemQuantity: nextFree }
              : c,
          )
        : prev,
    );
  };

  return (
    <>
      <View style={styles.cardContainer}>
        {/* ==== IMAGE AREA (press to open modal) ==== */}
        <View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (itemImage) setPreviewVisible(true);
            }}
          >
            <View>
              {itemImage ? (
                <Image
                  source={{ uri: itemImage }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>

            {discountApplied > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {String(discountApplied.toFixed())} %
                </Text>
              </View>
            )}

            {item.cashbackPercent > 0 && (
              <View
                style={{
                  backgroundColor: 'green',
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                <Text style={styles.discountText}>
                  {String(item.cashbackPercent.toFixed())} %
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ==== INFO AREA ==== */}
        <View style={styles.productInfoContainer}>
          <View>
            <Text
              style={styles.productName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {itemName}
            </Text>

            <View style={styles.priceRow}>
              <View>
                {discountApplied > 0 && (
                  <Text style={styles.originalPrice}>
                    {String(price.toLocaleString())} UZS
                  </Text>
                )}
                <Text style={styles.currentPrice}>
                  {String(
                    discountApplied > 0
                      ? discountedPrice.toLocaleString()
                      : price.toLocaleString(),
                  )}{' '}
                  UZS
                </Text>

                {!!cartLine && cartLine.freeItemQuantity > 0 && (
                  <Text style={{ fontSize: 12, color: color.primary }}>
                    {t('cart.freeItem')}: {cartLine.freeItemQuantity}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* ==== CART CONTROLS ==== */}
          {currentQty > 0 ? (
            <View style={styles.goToCartButton}>
              {loading ? (
                <ActivityIndicator size="small" color={color.primary} />
              ) : (
                <View
                  style={{
                    backgroundColor: color.darkGray,
                    borderColor: color.darkGray,
                    borderRadius: 20,
                    alignItems: 'center',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <TouchableOpacity
                    onPress={decrement}
                    activeOpacity={currentQty > 0 ? 0.8 : 1}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        color: 'white',
                        fontWeight: '700',
                        paddingHorizontal: 5,
                      }}
                    >
                      -
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={{
                      fontSize: 16,
                      marginVertical: 1,
                      fontWeight: '800',
                      color: 'white',
                    }}
                  >
                    {currentQty}
                  </Text>

                  <TouchableOpacity
                    onPress={increment}
                    activeOpacity={currentQty + currentFree < maxQty ? 0.8 : 1}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        color: 'white',
                        fontWeight: '700',
                        paddingHorizontal: 5,
                      }}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : item.quantityOnStock === 0 ? (
            <TouchableOpacity
              disabled
              activeOpacity={0.8}
              style={styles.outOfStockButton}
            >
              <Text numberOfLines={1} style={styles.outOfStockButtonText}>
                {t('productCard.noStock')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={addToCart}
              style={styles.addToCartButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text numberOfLines={1} style={styles.addToCartButtonText}>
                  {t('productCard.topItemsCardButton')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ==== FULLSCREEN PREVIEW MODAL ==== */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        {/* Dark backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={() => setPreviewVisible(false)}
        />

        {/* Content card */}
        <View style={styles.previewWrapper}>
          <View style={styles.previewCard}>
            {/* Close button */}
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={styles.closeBtn}
              hitSlop={10}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>

            {/* Big image */}
            {itemImage ? (
              <Image
                source={{ uri: itemImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.previewImage,
                  { backgroundColor: color.darkGray, borderRadius: 12 },
                ]}
              />
            )}

            {/* Name */}
            <Text style={styles.previewName} numberOfLines={2}>
              {itemName}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 4,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    minHeight: 280,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  imagePlaceholder: {
    height: 170,
    backgroundColor: color.darkGray,
  },
  discountBadge: {
    backgroundColor: color.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfoContainer: {
    padding: 8,
    justifyContent: 'space-between',
    height: 155,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  originalPrice: {
    color: color.darkGray,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 14,
    color: 'black',
    fontWeight: '400',
  },
  productName: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  goToCartButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  outOfStockButton: {
    backgroundColor: color.darkGray,
    borderColor: color.darkGray,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  outOfStockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: color.primary,
    borderColor: color.primary,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  /* ===== Preview modal styles ===== */
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    backgroundColor: 'white',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 16,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00000066',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 16,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  previewName: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
});
