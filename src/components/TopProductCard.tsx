import { t } from 'i18next';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { navigate } from '../utils/NavigationService';
import { useState } from 'react';
import { ItemInterface } from '../../interface';
import { color } from '../../color';

export function TopProductCard({
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
  const [previewVisible, setPreviewVisible] = useState(false);

  return (
    <>
      <View style={[styles.cardContainer]}>
        {/* Image Section */}
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

        {/* Product Information */}
        <View style={styles.productInfoContainer}>
          <View>
            {/* Product Name */}
            <Text
              style={styles.productName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {itemName}
            </Text>

            {/* Discounted or Regular Price */}
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
              </View>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={() => navigate('market')}
            activeOpacity={0.8}
            style={styles.addToCartButton}
          >
            <Text style={styles.addToCartButtonText}>
              {t('productCard.topItemsCardButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: 'white',
    borderRadius: 20,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  imagePlaceholder: {
    height: 170,
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
  },
  productInfoContainer: {
    height: 155,
    padding: 8,
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  originalPrice: {
    color: color.darkGray,
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    color: 'black',
    fontSize: 16,
    fontWeight: 500,
  },

  productName: {
    color: 'black',
    fontSize: 16,
    marginBottom: 5,
  },
  goToCartButton: {
    backgroundColor: 'white',
    borderColor: color.primary,
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  goToCartButtonText: {
    color: color.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outOfStockButton: {
    backgroundColor: color.darkGray,
    borderColor: color.darkGray,
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  outOfStockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: color.primary,
    borderColor: color.primary,
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
