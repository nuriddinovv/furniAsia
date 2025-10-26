import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { loadAll, markRead } from '../../utils/notificationStore';
import { StoredNotification } from '../../../interface';

export default function Notifications() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();

  const [items, setItems] = useState<StoredNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Header sozlamalari
  useFocusEffect(
    useCallback(() => {
      // header
      // @ts-ignore
      navigation.setOptions({
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        title: t('notifications.title'),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ paddingHorizontal: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
        ),
      });

      // ma'lumotni tortish
      let mounted = true;
      (async () => {
        const all = await loadAll();
        if (mounted) setItems(all);
      })();

      return () => {
        mounted = false;
      };
    }, [navigation, i18n.language]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const all = await loadAll();
    setItems(all);
    setRefreshing(false);
  }, []);

  const onPressItem = useCallback(
    async (item: StoredNotification) => {
      // o‘qilgan deb belgilaymiz
      if (!item.isRead) {
        await markRead(item.id, true);
        // UI’ni darhol yangilash
        setItems(prev =>
          prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
      }
      // Detal sahifaga o‘tamiz
      // @ts-ignore
      navigation.navigate('NotificationDetail', { id: item.id });
    },
    [navigation],
  );

  const renderItem = ({ item }: { item: StoredNotification }) => (
    <TouchableOpacity style={styles.row} onPress={() => onPressItem(item)}>
      <View style={styles.rowLeft}>
        {!item.isRead && <View style={styles.unreadDot} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title || t('notifications.defaultTitle')}
          </Text>
          <Text style={styles.body} numberOfLines={1}>
            {item.body || ''}
          </Text>
          <Text style={styles.date}>{formatDate(item.dateTime)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.safe}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && { flex: 1 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {t('notifications.noData') || 'No notifications found'}
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const formatDate = (iso?: string) => {
  try {
    const d = iso ? new Date(iso) : new Date();
    // Lokal format (kalendar + vaqt qisqa)
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return iso ?? '';
  }
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'red',
    marginRight: 2,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  body: { fontSize: 14, color: '#374151', marginTop: 2 },
  date: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: { fontSize: 16, color: 'gray' },
});
