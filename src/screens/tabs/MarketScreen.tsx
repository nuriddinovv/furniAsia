import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUserContext } from '../../utils/UserContext';
import { ItemBrands, ItemGroups, ProductsData } from '../../api/get';
import { navigate } from '../../utils/NavigationService';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ProductCard } from '../../components/ProductCard';
import FilterModal from '../../components/FilterModal';
import useFetch from '../../api/useFetch';
import { color } from '../../../color';
import { ItemInterface } from '../../../interface';

export default function MarketScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { sessionId, userData, cartItem } = useUserContext();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<ItemInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [itemsError, setItemsError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  type SortBy = 'price' | 'alphabet';
  type SortOrder = 'asc' | 'desc';

  const [filters, setFilters] = useState<{
    categories: number[];
    brands: number[];
    priceMin?: number;
    priceMax?: number;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
  }>({
    categories: [],
    brands: [],
  });

  const fetchProducts = useCallback(async () => {
    if (!hasMore && page !== 1) return;

    try {
      setIsLoading(true);
      setItemsError(null);

      const res = await ProductsData({
        cardCode: userData?.cardCode,
        page,
        sessionId,
        filters: {
          query: searchQuery,
          categories: filters.categories,
          brands: filters.brands,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
      });

      setItems(prevItems =>
        page === 1 ? res.data.items : [...prevItems, ...res.data.items],
      );

      if (res.data.items.length === 0 && page !== 1) {
        setHasMore(false);
      } else if (res.error) {
        Alert.alert(t('cart.error'), res.error.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    searchQuery,
    sessionId,
    userData?.cardCode,
    hasMore,
    filters,
    navigation,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, page, filters]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      setHasMore(true);
      fetchProducts();
      return () => {};
    }, []),
  );

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      setHasMore(true);
    }, 500); // 500 ms kutadi

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);
  useEffect(() => {
    navigation.setOptions({
      title: t('layout.market'),
      headerTitle: t('layout.market'),
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigate('cart')}
          style={{ marginRight: 15 }}
        >
          <FontAwesome5 name="shopping-cart" size={28} color={color.primary} />
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
                top: 1,
                textAlign: 'center',
                fontSize: 10,
                width: 14,
                height: 14,
              }}
            >
              {cartItem?.length
                ? cartItem.length > 9
                  ? '9+'
                  : cartItem.length
                : 0}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [i18n.language, navigation, cartItem]);

  const renderItem = ({ item }: { item: ItemInterface }) => (
    <ProductCard
      discountApplied={item.discountApplied}
      discountedPrice={item.discountedPrice}
      itemImage={item.itemImage}
      itemName={item.itemName}
      price={item.price}
      item={item}
    />
  );

  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    data: itemGroupsData,
    loading: itemGroupsLoading,
    error: itemGroupsError,
    refetch: itemGroupsRefetch,
  } = useFetch(async () => {
    return await ItemGroups({ sessionId });
  });
  const {
    data: itemBrandsData,
    loading: itemBrandsLoading,
    error: itemBrandsError,
    refetch: itemBrandsRefetch,
  } = useFetch(async () => {
    return await ItemBrands({ sessionId });
  });
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceMin ||
    filters.priceMax ||
    filters.sortBy ||
    filters.sortOrder;

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && page === 1 && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={color.primary} />
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 10,
        }}
      >
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('market.search')}
            value={searchQuery}
            placeholderTextColor={color.darkGray}
            onChangeText={text => {
              setSearchQuery(text);
            }}
          />
          <FontAwesome5
            name="search"
            size={24}
            color={color.darkGray}
            style={{ marginRight: 10 }}
          />
        </View>
        <TouchableOpacity
          onPress={() => setFiltersOpen(true)}
          style={{
            marginLeft: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome5
            name="filter"
            size={24}
            color={hasActiveFilters ? color.primary : color.darkGray}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={items}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setPage(1);
              setHasMore(true);
              // fetchProducts() side-effect orqali chaqiriladi
              setTimeout(() => setRefreshing(false), 300); // UI flicker'ni oldini olish
            }}
            colors={[color.primary]}
            tintColor={color.primary}
          />
        }
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        keyExtractor={(item, index) =>
          String(item.itemCode ?? item.id ?? index)
        }
        onEndReached={() => {
          if (!isLoading && hasMore) setPage(prev => prev + 1);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && items.length > 0 ? (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <ActivityIndicator size="large" color={color.primary} />
              <Text style={{ color: color.darkGray }}>
                {t('market.loading')}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={() => {
          if (!isLoading && items.length === 0) {
            return (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('market.noEpty')}</Text>
              </View>
            );
          }
          return null;
        }}
      />
      <FilterModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={p => {
          setFilters({
            categories: p.categories,
            brands: p.brands,
            priceMin: p.priceMin,
            priceMax: p.priceMax,
            sortBy: p.sortBy,
            sortOrder: p.sortOrder,
          });
          // filter o'zgarsa boshidan yuklash
          setPage(1);
          setHasMore(true);
          setFiltersOpen(false);
        }}
        categories={itemGroupsData?.data} // siz yuborgan Category JSON -> data
        brands={itemBrandsData?.data} // siz yuborgan Brands JSON -> data
        initial={filters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.gray,
    borderRadius: 20,
    padding: 8,
  },
  searchInput: {
    borderRadius: 20,
    width: '80%',
    padding: 4,
    color: 'black',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    marginHorizontal: 20,
    color: color.darkGray,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  loaderOverlay: {
    position: 'absolute',
    zIndex: 100,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
