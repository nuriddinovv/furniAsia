// NotificationDetail.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { loadAll } from '../../utils/notificationStore';
import { t } from 'i18next';
import { StoredNotification } from '../../../interface';

type Param = { NotificationDetail: { id: number } };

export default function NotificationDetail() {
  const route = useRoute<RouteProp<Param, 'NotificationDetail'>>();
  const [item, setItem] = useState<StoredNotification | null>(null);
  const navigation = useNavigation();
  navigation.setOptions({
    headerShadowVisible: false,
    headerTitleAlign: 'center',
    title: !item
      ? t('notification.title')
      : new Date(item.dateTime).toLocaleString(),
  });

  useEffect(() => {
    (async () => {
      const list = await loadAll();
      const found = list.find(n => n.id === route.params?.id);
      setItem(found ?? null);
    })();
  }, [route.params?.id]);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#6B7280' }}>Not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 8, backgroundColor: 'white', minHeight: '100%' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  body: { fontSize: 15, color: '#374151', lineHeight: 22 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
