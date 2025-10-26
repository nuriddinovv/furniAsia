// notificationStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, StoredNotification } from '../../interface';

export const loadAll = async (): Promise<StoredNotification[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredNotification[]) : [];
};

const saveAll = async (items: StoredNotification[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addNotification = async (title: string, body: string) => {
  const items = await loadAll();
  const nextId = (items[0]?.id ?? 0) + 1;
  const item: StoredNotification = {
    id: nextId,
    title,
    body,
    dateTime: new Date().toISOString(),
    isRead: false,
  };
  const updated = [item, ...items].slice(0, 500);
  await saveAll(updated);
  return item;
};

export const markRead = async (id: number, read = true) => {
  const items = await loadAll();
  const updated = items.map(n => (n.id === id ? { ...n, isRead: read } : n));
  await saveAll(updated);
};

export const markAllRead = async () => {
  const items = await loadAll();
  await saveAll(items.map(n => ({ ...n, isRead: true })));
};

export const unreadCount = async () => {
  const items = await loadAll();
  return items.filter(n => !n.isRead).length;
};
